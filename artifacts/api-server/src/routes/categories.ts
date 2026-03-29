import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { wishlistTable, productsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { randomBytes } from "crypto";
import { extractUser } from "./auth";

const router: IRouter = Router();

function generateId(): string {
  return randomBytes(16).toString("hex");
}

// Get all categories
router.get("/", (_req, res) => {
  const categories = [
    { id: "books", name: "Books", icon: "📚" },
    { id: "electronics", name: "Electronics", icon: "💻" },
    { id: "fashion", name: "Fashion", icon: "👕" },
    { id: "food", name: "Food", icon: "🍕" },
    { id: "stationery", name: "Stationery", icon: "✏️" },
    { id: "nrooms", name: "Rooms", icon: "🏠" },
  ];
  res.json(categories);
});

// Get wishlist
router.get("/wishlist", async (req, res) => {
  const userId = extractUser(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const items = await db.select({
      wishlist: wishlistTable,
      product: productsTable,
    }).from(wishlistTable)
      .leftJoin(productsTable, eq(wishlistTable.productId, productsTable.id))
      .where(eq(wishlistTable.userId, userId));

    const wishlist = items.map(({ product }) => product).filter(Boolean);
    res.json(wishlist);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch wishlist" });
  }
});

// Add to wishlist
router.post("/wishlist/add", async (req, res) => {
  const userId = extractUser(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const { productId } = req.body;
    if (!productId) {
      res.status(400).json({ error: "Product ID required" });
      return;
    }

    // Check if already wishlisted
    const [existing] = await db.select().from(wishlistTable)
      .where(and(eq(wishlistTable.userId, userId), eq(wishlistTable.productId, productId)));

    if (existing) {
      res.status(400).json({ error: "Already in wishlist" });
      return;
    }

    const id = generateId();
    const [item] = await db.insert(wishlistTable).values({
      id,
      userId,
      productId,
    }).returning();

    res.status(201).json(item);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to add to wishlist" });
  }
});

// Remove from wishlist
router.delete("/wishlist/:productId", async (req, res) => {
  const userId = extractUser(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    await db.delete(wishlistTable)
      .where(and(eq(wishlistTable.userId, userId), eq(wishlistTable.productId, req.params.productId)));
    res.json({ success: true, message: "Removed from wishlist" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to remove from wishlist" });
  }
});

export default router;
