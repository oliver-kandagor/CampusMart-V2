import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { productsTable, usersTable, wishlistTable } from "@workspace/db";
import { eq, ilike, and, desc, asc, sql } from "drizzle-orm";
import { randomBytes } from "crypto";
import { sign, verify } from "jsonwebtoken";
import { getLocalDB, saveLocalDB } from "../lib/mock-storage";
import { extractUser } from "./auth";

const router: IRouter = Router();

function generateId(): string {
  return randomBytes(16).toString("hex");
}

// Mock data for development
const mockProducts = [
  {
    id: "prod1",
    title: "Introduction to Algorithms",
    description: "Classic computer science textbook",
    price: 2500,
    originalPrice: 3500,
    category: "books",
    condition: "like_new",
    campus: "Main Campus",
    images: ["https://via.placeholder.com/300"],
    stock: 5,
    status: "active",
    badge: "SALE",
    featured: true,
    sellerId: "user1",
    sellerUsername: "john_doe",
    sellerAvatar: null,
    sellerRating: 4.5,
    isWishlisted: false,
    createdAt: new Date(),
  },
  {
    id: "prod2",
    title: "MacBook Pro 13\"",
    description: "2021 model, excellent condition",
    price: 45000,
    originalPrice: null,
    category: "electronics",
    condition: "good",
    campus: "Main Campus",
    images: ["https://via.placeholder.com/300"],
    stock: 1,
    status: "active",
    badge: "NEW",
    featured: true,
    sellerId: "user1",
    sellerUsername: "john_doe",
    sellerAvatar: null,
    sellerRating: 4.5,
    isWishlisted: false,
    createdAt: new Date(),
  },
  {
    id: "prod3",
    title: "Winter Jacket",
    description: "Warm and comfortable",
    price: 1500,
    originalPrice: 2000,
    category: "fashion",
    condition: "new",
    campus: "Main Campus",
    images: ["https://via.placeholder.com/300"],
    stock: 10,
    status: "active",
    badge: "SALE",
    featured: false,
    sellerId: "user1",
    sellerUsername: "john_doe",
    sellerAvatar: null,
    sellerRating: 4.5,
    isWishlisted: false,
    createdAt: new Date(),
  },
];

// In-memory store for mock-mode created products linked to laptop mock file
const mockCreated: typeof mockProducts = getLocalDB().products as any;


// Get all products with filters
router.get("/", async (req, res) => {
  try {
    const userId = extractUser(req);
    const { category, campus, search, sort, page = "1", limit = "20", featured } = req.query as any;

    try {
      let query = db.select({
        product: productsTable,
        sellerUsername: usersTable.username,
        sellerAvatar: usersTable.avatarUrl,
      }).from(productsTable).leftJoin(usersTable, eq(productsTable.sellerId, usersTable.id));

      const conditions = [eq(productsTable.status, "active")];
      if (category && category !== "all") conditions.push(eq(productsTable.category, category));
      if (campus) conditions.push(eq(productsTable.campus, campus));
      if (search) conditions.push(ilike(productsTable.title, `%${search}%`));
      if (featured === "true") conditions.push(eq(productsTable.featured, true));

      const rows = await query.where(and(...conditions))
        .orderBy(
          sort === "price_asc" ? asc(productsTable.price) :
          sort === "price_desc" ? desc(productsTable.price) :
          desc(productsTable.createdAt)
        )
        .limit(Number(limit))
        .offset((Number(page) - 1) * Number(limit));

      let wishlistedIds: Set<string> = new Set();
      if (userId) {
        const wl = await db.select({ productId: wishlistTable.productId }).from(wishlistTable)
          .where(eq(wishlistTable.userId, userId));
        wishlistedIds = new Set(wl.map(w => w.productId));
      }

      const products = rows.map(({ product, sellerUsername, sellerAvatar }) => ({
        id: product.id,
        title: product.title,
        description: product.description,
        price: product.price,
        originalPrice: product.originalPrice,
        category: product.category,
        condition: product.condition,
        campus: product.campus,
        images: product.images,
        stock: product.stock,
        status: product.status,
        badge: product.badge,
        sellerId: product.sellerId,
        sellerUsername: sellerUsername || "Unknown",
        sellerAvatar: sellerAvatar,
        sellerRating: 4.5,
        isWishlisted: wishlistedIds.has(product.id),
        createdAt: product.createdAt,
      }));

      const totalRows = await db.select({ count: sql<number>`count(*)` })
        .from(productsTable)
        .where(and(...conditions));
      const total = Number(totalRows[0]?.count || 0);

      res.json({
        products,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
      });
    } catch (dbErr) {
      // Use mock data if database fails
      let filtered = [...mockCreated, ...mockProducts];
      
      if (category && category !== "all") {
        filtered = filtered.filter(p => p.category === category);
      }
      if (campus) {
        filtered = filtered.filter(p => p.campus === campus);
      }
      if (search) {
        filtered = filtered.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));
      }
      if (featured === "true") {
        filtered = filtered.filter(p => (p as any).featured);
      }

      if (sort === "price_asc") {
        filtered.sort((a, b) => a.price - b.price);
      } else if (sort === "price_desc") {
        filtered.sort((a, b) => b.price - a.price);
      } else {
        // newest
        filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }

      const pageNum = Number(page);
      const limitNum = Number(limit);
      const start = (pageNum - 1) * limitNum;
      const end = start + limitNum;
      const paginatedProducts = filtered.slice(start, end);

      res.json({
        products: paginatedProducts,
        total: filtered.length,
        page: pageNum,
        totalPages: Math.ceil(filtered.length / limitNum),
      });
    }
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Create a new product
router.post("/", async (req, res) => {
  const userId = extractUser(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const { title, description, price, originalPrice, category, condition, campus, images, stock } = req.body;
    if (!title || !price || !category || !condition || !campus) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const id = generateId();
    try {
      const [product] = await db.insert(productsTable).values({
        id,
        sellerId: userId,
        title,
        description: description || null,
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : null,
        category,
        condition,
        campus,
        images: images || [],
        stock: stock || 1,
        badge: originalPrice && Number(originalPrice) > Number(price) ? "SALE" : "NEW",
      }).returning();
      res.status(201).json(product);
    } catch (dbErr) {
      // Mock fallback — store in memory so it shows up in subsequent GET calls
      const mockProduct: (typeof mockProducts)[number] = {
        id,
        title,
        description: description || "",
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : null as any,
        category,
        condition,
        campus,
        images: images || [],
        stock: stock || 1,
        status: "active",
        badge: originalPrice && Number(originalPrice) > Number(price) ? "SALE" : "NEW",
        featured: true,
        sellerId: userId,
        sellerUsername: "you",
        sellerAvatar: null as any,
        sellerRating: 5.0,
        isWishlisted: false,
        createdAt: new Date(),
      };
      mockCreated.unshift(mockProduct);
      saveLocalDB();
      res.status(201).json(mockProduct);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create product" });
  }
});

// Get product by ID
router.get("/:id", async (req, res) => {
  try {
    const userId = extractUser(req);
    
    try {
      const [row] = await db.select({
        product: productsTable,
        sellerUsername: usersTable.username,
        sellerAvatar: usersTable.avatarUrl,
      }).from(productsTable)
        .leftJoin(usersTable, eq(productsTable.sellerId, usersTable.id))
        .where(eq(productsTable.id, req.params.id));

      if (!row) {
        res.status(404).json({ error: "Product not found" });
        return;
      }

      let isWishlisted = false;
      if (userId) {
        const wl = await db.select().from(wishlistTable)
          .where(and(eq(wishlistTable.userId, userId), eq(wishlistTable.productId, req.params.id)));
        isWishlisted = wl.length > 0;
      }

      res.json({
        ...row.product,
        sellerUsername: row.sellerUsername || "Unknown",
        sellerAvatar: row.sellerAvatar,
        sellerRating: 4.5,
        isWishlisted,
      });
    } catch (dbErr) {
      // Use mock data if database fails
      const product = mockProducts.find(p => p.id === req.params.id);
      if (!product) {
        res.status(404).json({ error: "Product not found" });
        return;
      }
      res.json(product);
    }
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// Update product
router.put("/:id", async (req, res) => {
  const userId = extractUser(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const { title, description, price, originalPrice, category, condition, campus, images, stock, status } = req.body;
    
    const [existing] = await db.select().from(productsTable).where(eq(productsTable.id, req.params.id));
    if (!existing || existing.sellerId !== userId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const [updated] = await db.update(productsTable)
      .set({
        title: title || existing.title,
        description: description !== undefined ? description : existing.description,
        price: price ? Number(price) : existing.price,
        originalPrice: originalPrice ? Number(originalPrice) : existing.originalPrice,
        category: category || existing.category,
        condition: condition || existing.condition,
        campus: campus || existing.campus,
        images: images || existing.images,
        stock: stock ? Number(stock) : existing.stock,
        status: status || existing.status,
      })
      .where(eq(productsTable.id, req.params.id))
      .returning();

    res.json(updated);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update product" });
  }
});

// Delete product
router.delete("/:id", async (req, res) => {
  const userId = extractUser(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const [existing] = await db.select().from(productsTable).where(eq(productsTable.id, req.params.id));
    if (!existing || existing.sellerId !== userId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    await db.delete(productsTable).where(eq(productsTable.id, req.params.id));
    res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

// Get seller's products
router.get("/seller/:sellerId", async (req, res) => {
  try {
    const products = await db.select().from(productsTable)
      .where(and(eq(productsTable.sellerId, req.params.sellerId), eq(productsTable.status, "active")));
    res.json(products);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch seller products" });
  }
});

export default router;
