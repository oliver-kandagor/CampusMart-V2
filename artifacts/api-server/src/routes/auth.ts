import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq, or } from "drizzle-orm";
import { createHash, randomBytes } from "crypto";
import { sign, verify } from "jsonwebtoken";
import { getLocalDB, saveLocalDB } from "../lib/mock-storage";

const router: IRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || "campusmart-secret-2024";

// In-memory user storage for mock mode backed by local JSON file
export const mockUsers = new Map<string, any>();
getLocalDB().users.forEach((u) => mockUsers.set(u.id, u));
export let useMockDB = false;

// Pre-fill a standard user for easy testing
mockUsers.set("test-user-1", {
  id: "test-user-1",
  email: "student@campus.ac.ke",
  phone: "0712345678",
  username: "johndoe",
  passwordHash: hashPassword("password123"),
  campus: "University of Nairobi",
  avatarUrl: null,
  role: "student",
  createdAt: new Date(),
});

// Test database connection on startup
(async () => {
  try {
    await db.select().from(usersTable).limit(1);
    console.log("✓ Database connection successful");
  } catch (err) {
    console.log("✗ Database connection failed, using mock storage");
    useMockDB = true;
  }
})();

function hashPassword(password: string): string {
  return createHash("sha256").update(password + "campusmart-salt").digest("hex");
}

function generateId(): string {
  return randomBytes(16).toString("hex");
}

function generateToken(userId: string): string {
  return sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}

export function extractUser(req: any): string | null {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) return null;
  try {
    const token = auth.slice(7);
    const payload = verify(token, JWT_SECRET) as any;
    return payload.userId;
  } catch {
    return null;
  }
}

router.post("/register", async (req, res) => {
  try {
    const { email, phone, username, password, campus } = req.body;
    if (!email || !username || !password) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    // Convert empty strings to null
    const cleanPhone = phone && phone.trim() !== "" ? phone : null;
    const cleanCampus = campus && campus.trim() !== "" ? campus : null;

    if (useMockDB) {
      // Use mock storage
      const existingByEmail = Array.from(mockUsers.values()).find(u => u.email === email);
      const existingByUsername = Array.from(mockUsers.values()).find(u => u.username === username);

      if (existingByEmail || existingByUsername) {
        res.status(400).json({ error: "Email or username already exists" });
        return;
      }

      const id = generateId();
      const user = {
        id,
        email,
        phone: cleanPhone,
        username,
        passwordHash: hashPassword(password),
        campus: cleanCampus,
        avatarUrl: null,
        role: "student",
        createdAt: new Date(),
      };

      mockUsers.set(id, user);
      
      const dbInstance = getLocalDB();
      dbInstance.users.push(user);
      saveLocalDB();

      const token = generateToken(user.id);
      res.status(201).json({
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          username: user.username,
          campus: user.campus,
          avatarUrl: user.avatarUrl,
          role: user.role,
          createdAt: user.createdAt,
        },
        token,
      });
    } else {
      // Use database
      try {
        const existing = await db.select().from(usersTable).where(
          or(eq(usersTable.email, email), eq(usersTable.username, username))
        ).limit(1);

        if (existing.length > 0) {
          res.status(400).json({ error: "Email or username already exists" });
          return;
        }

        const id = generateId();
        const [user] = await db.insert(usersTable).values({
          id,
          email,
          phone: cleanPhone,
          username,
          passwordHash: hashPassword(password),
          campus: cleanCampus,
          role: "student",
        }).returning();

        const token = generateToken(user.id);
        res.status(201).json({
          user: {
            id: user.id,
            email: user.email,
            phone: user.phone,
            username: user.username,
            campus: user.campus,
            avatarUrl: user.avatarUrl,
            role: user.role,
            createdAt: user.createdAt,
          },
          token,
        });
      } catch (dbErr) {
        // Fallback to mock if database fails
        useMockDB = true;
        res.status(500).json({ error: "Database error, please try again" });
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;
    if (!emailOrPhone || !password) {
      res.status(400).json({ error: "Missing credentials" });
      return;
    }

    const hashedPassword = hashPassword(password);

    if (useMockDB) {
      // Use mock storage
      const user = Array.from(mockUsers.values()).find(
        u => (u.email === emailOrPhone || u.phone === emailOrPhone) && u.passwordHash === hashedPassword
      );

      if (!user) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      const token = generateToken(user.id);
      res.json({
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          username: user.username,
          campus: user.campus,
          avatarUrl: user.avatarUrl,
          role: user.role,
          createdAt: user.createdAt,
        },
        token,
      });
    } else {
      // Use database
      try {
        const [user] = await db.select().from(usersTable).where(
          or(eq(usersTable.email, emailOrPhone), eq(usersTable.phone, emailOrPhone))
        ).limit(1);

        if (!user || user.passwordHash !== hashedPassword) {
          res.status(401).json({ error: "Invalid credentials" });
          return;
        }

        const token = generateToken(user.id);
        res.json({
          user: {
            id: user.id,
            email: user.email,
            phone: user.phone,
            username: user.username,
            campus: user.campus,
            avatarUrl: user.avatarUrl,
            role: user.role,
            createdAt: user.createdAt,
          },
          token,
        });
      } catch (dbErr) {
        // Fallback to mock if database fails
        useMockDB = true;
        res.status(500).json({ error: "Database error, please try again" });
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

router.get("/me", async (req, res) => {
  const userId = extractUser(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    if (useMockDB) {
      // Use mock storage
      const user = mockUsers.get(userId);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      res.json({
        id: user.id,
        email: user.email,
        phone: user.phone,
        username: user.username,
        campus: user.campus,
        avatarUrl: user.avatarUrl,
        role: user.role,
        createdAt: user.createdAt,
      });
    } else {
      // Use database
      try {
        const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
        if (!user) {
          res.status(404).json({ error: "User not found" });
          return;
        }
        res.json({
          id: user.id,
          email: user.email,
          phone: user.phone,
          username: user.username,
          campus: user.campus,
          avatarUrl: user.avatarUrl,
          role: user.role,
          createdAt: user.createdAt,
        });
      } catch (dbErr) {
        // Fallback to mock if database fails
        useMockDB = true;
        res.status(500).json({ error: "Database error, please try again" });
      }
    }
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get user" });
  }
});

router.post("/logout", (_req, res) => {
  res.json({ success: true, message: "Logged out" });
});

export default router;
