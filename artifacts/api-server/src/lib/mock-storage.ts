import fs from "fs";
import path from "path";

// A dedicated local JSON file on the user's laptop for testing
const DATA_FILE = path.join(process.cwd(), "local-laptop-database.json");

interface MockDB {
  users: any[];
  products: any[];
}

function loadData(): MockDB {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
      
      // Revive Date objects from JSON string
      if (parsed.users) {
        parsed.users.forEach((u: any) => { if (u.createdAt) u.createdAt = new Date(u.createdAt); });
      }
      if (parsed.products) {
        parsed.products.forEach((p: any) => { if (p.createdAt) p.createdAt = new Date(p.createdAt); });
      }
      
      return {
        users: parsed.users || [],
        products: parsed.products || [],
      };
    }
  } catch (err) {
    console.warn("Failed to read local DB, initializing new one", err);
  }
  return { users: [], products: [] };
}

function saveData(data: MockDB) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write to local DB", err);
  }
}

let dbCache: MockDB | null = null;

export function getLocalDB(): MockDB {
  if (!dbCache) {
    dbCache = loadData();
  }
  return dbCache;
}

export function saveLocalDB() {
  if (dbCache) {
    saveData(dbCache);
  }
}
