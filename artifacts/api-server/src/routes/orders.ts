import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { ordersTable, cartItemsTable, productsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { randomBytes } from "crypto";
import { extractUser } from "./auth";

const router: IRouter = Router();

function generateId(): string {
  return randomBytes(16).toString("hex");
}

function generateOrderId(): string {
  return "ORD-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9).toUpperCase();
}

// Mock storage
let useMockDB = false;
const mockOrders = new Map<string, any[]>(); // userId -> orders[]

// Test database connection
(async () => {
  try {
    await db.select().from(ordersTable).limit(1);
    useMockDB = false;
    console.log("✓ Orders: Using PostgreSQL database");
  } catch (err) {
    useMockDB = true;
    console.log("⚠ Orders: Database unavailable, using mock storage");
  }
})();

// Get user's orders
router.get("/", async (req, res) => {
  const userId = extractUser(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    if (useMockDB) {
      const orders = mockOrders.get(userId) || [];
      res.json(orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      return;
    }

    const orders = await db.select().from(ordersTable)
      .where(eq(ordersTable.buyerId, userId))
      .orderBy(desc(ordersTable.createdAt));

    res.json(orders);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Get order by ID
router.get("/:id", async (req, res) => {
  const userId = extractUser(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const [order] = await db.select().from(ordersTable)
      .where(and(eq(ordersTable.id, req.params.id), eq(ordersTable.buyerId, userId)));

    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    res.json(order);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

// Create order from cart (checkout)
router.post("/checkout", async (req, res) => {
  const userId = extractUser(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const { deliveryAddress } = req.body;
    if (!deliveryAddress) {
      res.status(400).json({ error: "Delivery address required" });
      return;
    }

    if (useMockDB) {
      // Mock checkout
      const id = generateId();
      const orderId = generateOrderId();
      const order = {
        id,
        orderId,
        buyerId: userId,
        items: [],
        totalAmount: 5000,
        status: "confirmed",
        deliveryAddress,
        createdAt: new Date().toISOString(),
      };
      
      const userOrders = mockOrders.get(userId) || [];
      userOrders.push(order);
      mockOrders.set(userId, userOrders);
      
      res.status(201).json(order);
      return;
    }

    // Get cart items
    const cartItems = await db.select({
      cartItem: cartItemsTable,
      product: productsTable,
    }).from(cartItemsTable)
      .leftJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
      .where(eq(cartItemsTable.userId, userId));

    if (cartItems.length === 0) {
      res.status(400).json({ error: "Cart is empty" });
      return;
    }

    // Calculate total and prepare items
    let totalAmount = 0;
    const items: any[] = [];

    for (const { cartItem, product } of cartItems) {
      if (!product) continue;
      
      if (product.stock < cartItem.quantity) {
        res.status(400).json({ error: `Insufficient stock for ${product.title}` });
        return;
      }

      totalAmount += product.price * cartItem.quantity;
      items.push({
        productId: product.id,
        title: product.title,
        price: product.price,
        quantity: cartItem.quantity,
        sellerId: product.sellerId,
      });

      // Reduce stock
      await db.update(productsTable)
        .set({ stock: product.stock - cartItem.quantity })
        .where(eq(productsTable.id, product.id));
    }

    // Create order
    const id = generateId();
    const orderId = generateOrderId();
    const [order] = await db.insert(ordersTable).values({
      id,
      orderId,
      buyerId: userId,
      items: items as any,
      totalAmount,
      status: "confirmed",
      deliveryAddress,
    }).returning();

    // Clear cart
    await db.delete(cartItemsTable).where(eq(cartItemsTable.userId, userId));

    res.status(201).json(order);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// Update order status (admin only)
router.put("/:id/status", async (req, res) => {
  const userId = extractUser(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const { status } = req.body;
    if (!status) {
      res.status(400).json({ error: "Status required" });
      return;
    }

    const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, req.params.id));
    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    const [updated] = await db.update(ordersTable)
      .set({ status })
      .where(eq(ordersTable.id, req.params.id))
      .returning();

    res.json(updated);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update order" });
  }
});

// Cancel order
router.post("/:id/cancel", async (req, res) => {
  const userId = extractUser(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const [order] = await db.select().from(ordersTable)
      .where(and(eq(ordersTable.id, req.params.id), eq(ordersTable.buyerId, userId)));

    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    if (order.status !== "pending" && order.status !== "confirmed") {
      res.status(400).json({ error: "Cannot cancel this order" });
      return;
    }

    // Restore stock
    const items = order.items as any[];
    for (const item of items) {
      const [product] = await db.select().from(productsTable).where(eq(productsTable.id, item.productId));
      if (product) {
        await db.update(productsTable)
          .set({ stock: product.stock + item.quantity })
          .where(eq(productsTable.id, item.productId));
      }
    }

    const [updated] = await db.update(ordersTable)
      .set({ status: "cancelled" })
      .where(eq(ordersTable.id, req.params.id))
      .returning();

    res.json(updated);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to cancel order" });
  }
});

export default router;
