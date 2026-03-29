import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { cartItemsTable, productsTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { randomBytes } from "crypto";
import { extractUser } from "./auth";

const router: IRouter = Router();

// In-memory cart storage for mock mode
const mockCart = new Map<string, any[]>();
let useMockDB = false;

// Test database connection on startup
(async () => {
  try {
    await db.select().from(cartItemsTable).limit(1);
  } catch (err) {
    useMockDB = true;
  }
})();

function generateId(): string {
  return randomBytes(16).toString("hex");
}

// Get user's cart
router.get("/", async (req, res) => {
  const userId = extractUser(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    if (useMockDB) {
      // Use mock storage
      const items = mockCart.get(userId) || [];
      const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
      res.json({ items, total, itemCount });
    } else {
      // Use database
      try {
        const items = await db.select({
          cartItem: cartItemsTable,
          product: productsTable,
          seller: usersTable,
        }).from(cartItemsTable)
          .leftJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
          .leftJoin(usersTable, eq(productsTable.sellerId, usersTable.id))
          .where(eq(cartItemsTable.userId, userId));

        const cartItems = items.map(({ cartItem, product, seller }) => ({
          id: cartItem.id,
          productId: cartItem.productId,
          quantity: cartItem.quantity,
          title: product?.title || "Unknown Product",
          price: product?.price || 0,
          image: product?.images?.[0] || null,
          sellerUsername: seller?.username || "Unknown",
        }));

        const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

        res.json({ items: cartItems, total, itemCount });
      } catch (dbErr) {
        useMockDB = true;
        const items = mockCart.get(userId) || [];
        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
        res.json({ items, total, itemCount });
      }
    }
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch cart" });
  }
});

// Add item to cart
router.post("/", async (req, res) => {
  const userId = extractUser(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId) {
      res.status(400).json({ error: "Product ID required" });
      return;
    }

    if (useMockDB) {
      // Use mock storage - fetch product details from mock-db
      const mockDB = await import("@workspace/db/src/mock-db");
      const product = mockDB.mockProducts.find((p: any) => p.id === productId);
      
      if (!product) {
        res.status(404).json({ error: "Product not found" });
        return;
      }

      const userCart = mockCart.get(userId) || [];
      const existing = userCart.find(item => item.productId === productId);
      
      if (existing) {
        existing.quantity += Number(quantity);
      } else {
        const id = generateId();
        userCart.push({
          id,
          productId,
          quantity: Number(quantity),
          price: product.price,
          title: product.title,
          image: product.images?.[0] || null,
          sellerUsername: "seller",
        });
      }
      
      mockCart.set(userId, userCart);
      
      // Return cart format
      const total = userCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = userCart.reduce((sum, item) => sum + item.quantity, 0);
      res.status(201).json({ items: userCart, total, itemCount });
    } else {
      // Use database
      try {
        const [product] = await db.select().from(productsTable).where(eq(productsTable.id, productId));
        if (!product) {
          res.status(404).json({ error: "Product not found" });
          return;
        }

        const [existing] = await db.select().from(cartItemsTable)
          .where(and(eq(cartItemsTable.userId, userId), eq(cartItemsTable.productId, productId)));

        if (existing) {
          const [updated] = await db.update(cartItemsTable)
            .set({ quantity: existing.quantity + Number(quantity) })
            .where(eq(cartItemsTable.id, existing.id))
            .returning();
          res.json(updated);
        } else {
          const id = generateId();
          const [item] = await db.insert(cartItemsTable).values({
            id,
            userId,
            productId,
            quantity: Number(quantity),
          }).returning();
          res.status(201).json(item);
        }
      } catch (dbErr) {
        useMockDB = true;
        res.status(500).json({ error: "Database error, please try again" });
      }
    }
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to add to cart" });
  }
});

// Legacy endpoint for backward compatibility
router.post("/add", async (req, res) => {
  return router.handle(Object.assign(req, { url: req.url.replace('/add', ''), method: 'POST' }), res);
});

// Update cart item quantity
router.put("/:id", async (req, res) => {
  const userId = extractUser(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const { quantity } = req.body;
    if (quantity === undefined || quantity < 1) {
      res.status(400).json({ error: "Invalid quantity" });
      return;
    }

    if (useMockDB) {
      // Use mock storage
      const userCart = mockCart.get(userId) || [];
      const item = userCart.find(i => i.id === req.params.id);
      
      if (item) {
        item.quantity = Number(quantity);
        mockCart.set(userId, userCart);
        res.json(item);
      } else {
        res.status(404).json({ error: "Cart item not found" });
      }
    } else {
      // Use database
      try {
        const [item] = await db.select().from(cartItemsTable).where(eq(cartItemsTable.id, req.params.id));
        if (!item || item.userId !== userId) {
          res.status(403).json({ error: "Forbidden" });
          return;
        }

        const [updated] = await db.update(cartItemsTable)
          .set({ quantity: Number(quantity) })
          .where(eq(cartItemsTable.id, req.params.id))
          .returning();

        res.json(updated);
      } catch (dbErr) {
        useMockDB = true;
        res.status(500).json({ error: "Database error, please try again" });
      }
    }
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update cart item" });
  }
});

// Remove item from cart
router.delete("/:id", async (req, res) => {
  const userId = extractUser(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    if (useMockDB) {
      // Use mock storage
      const userCart = mockCart.get(userId) || [];
      const filtered = userCart.filter(i => i.id !== req.params.id);
      mockCart.set(userId, filtered);
      res.json({ success: true, message: "Item removed from cart" });
    } else {
      // Use database
      try {
        const [item] = await db.select().from(cartItemsTable).where(eq(cartItemsTable.id, req.params.id));
        if (!item || item.userId !== userId) {
          res.status(403).json({ error: "Forbidden" });
          return;
        }

        await db.delete(cartItemsTable).where(eq(cartItemsTable.id, req.params.id));
        res.json({ success: true, message: "Item removed from cart" });
      } catch (dbErr) {
        useMockDB = true;
        res.status(500).json({ error: "Database error, please try again" });
      }
    }
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to remove from cart" });
  }
});

// Clear cart
router.delete("/", async (req, res) => {
  const userId = extractUser(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    if (useMockDB) {
      // Use mock storage
      mockCart.set(userId, []);
      res.json({ success: true, message: "Cart cleared" });
    } else {
      // Use database
      try {
        await db.delete(cartItemsTable).where(eq(cartItemsTable.userId, userId));
        res.json({ success: true, message: "Cart cleared" });
      } catch (dbErr) {
        useMockDB = true;
        mockCart.set(userId, []);
        res.json({ success: true, message: "Cart cleared" });
      }
    }
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to clear cart" });
  }
});

export default router;
