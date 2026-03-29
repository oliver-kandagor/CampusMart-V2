// Mock in-memory database for development without PostgreSQL
import * as schema from "./schema";

interface MockDB {
  users: Map<string, any>;
  products: Map<string, any>;
  cartItems: Map<string, any>;
  wishlist: Map<string, any>;
  orders: Map<string, any>;
  rooms: Map<string, any>;
  foodVendors: Map<string, any>;
  foodItems: Map<string, any>;
}

const mockDB: MockDB = {
  users: new Map(),
  products: new Map(),
  cartItems: new Map(),
  wishlist: new Map(),
  orders: new Map(),
  rooms: new Map(),
  foodVendors: new Map(),
  foodItems: new Map(),
};

// Initialize with sample data
function initializeMockData() {
  // Sample users
  mockDB.users.set("user1", {
    id: "user1",
    email: "john@example.com",
    phone: "0712345678",
    username: "john_doe",
    passwordHash: "hashed_password",
    campus: "Main Campus",
    avatarUrl: null,
    role: "student",
    createdAt: new Date(),
  });

  // Sample products
  mockDB.products.set("prod1", {
    id: "prod1",
    sellerId: "user1",
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
    createdAt: new Date(),
  });

  mockDB.products.set("prod2", {
    id: "prod2",
    sellerId: "user1",
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
    createdAt: new Date(),
  });

  mockDB.products.set("prod3", {
    id: "prod3",
    sellerId: "user1",
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
    createdAt: new Date(),
  });

  // Sample rooms
  mockDB.rooms.set("room1", {
    id: "room1",
    landlordId: "user1",
    title: "Cozy Bedsitter",
    description: "Fully furnished, near campus",
    type: "bedsitter",
    monthlyRent: 8000,
    campus: "Main Campus",
    distanceToCampus: "500m",
    images: ["https://via.placeholder.com/300"],
    amenities: ["WiFi", "Water", "Electricity"],
    available: true,
    landlordPhone: "0712345678",
    createdAt: new Date(),
  });

  // Sample food vendors
  mockDB.foodVendors.set("vendor1", {
    id: "vendor1",
    name: "Campus Eats",
    campus: "Main Campus",
    bannerImage: "https://via.placeholder.com/600x200",
    rating: 4.5,
    deliveryTime: "20-30 min",
    minOrder: 500,
    categories: ["Pizza", "Burgers", "Salads"],
    isOpen: true,
    createdAt: new Date(),
  });

  // Sample food items
  mockDB.foodItems.set("food1", {
    id: "food1",
    vendorId: "vendor1",
    name: "Margherita Pizza",
    description: "Classic pizza with fresh mozzarella",
    price: 1200,
    image: "https://via.placeholder.com/300",
    category: "Pizza",
    available: true,
    createdAt: new Date(),
  });
}

initializeMockData();

export { mockDB };
