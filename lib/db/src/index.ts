import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";
import { mockDB } from "./mock-db";

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/postgres";

let db: any;
let pool: any;

try {
  pool = new Pool({ connectionString, connectionTimeoutMillis: 2000 });
  db = drizzle(pool, { schema });
  
  // Test connection
  pool.query("SELECT 1").catch(() => {
    console.warn("PostgreSQL connection failed, using mock database");
    db = createMockDrizzle();
  });
} catch (err) {
  console.warn("PostgreSQL connection failed, using mock database");
  db = createMockDrizzle();
}

// Create a mock Drizzle-like interface
function createMockDrizzle() {
  return {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: () => Promise.resolve([]),
          offset: () => ({
            limit: () => Promise.resolve([]),
          }),
        }),
        leftJoin: () => ({
          where: () => ({
            limit: () => Promise.resolve([]),
            offset: () => ({
              limit: () => Promise.resolve([]),
            }),
          }),
          orderBy: () => ({
            limit: () => Promise.resolve([]),
            offset: () => ({
              limit: () => Promise.resolve([]),
            }),
          }),
        }),
        orderBy: () => ({
          limit: () => Promise.resolve([]),
          offset: () => ({
            limit: () => Promise.resolve([]),
          }),
        }),
      }),
    }),
    insert: () => ({
      values: () => ({
        returning: () => Promise.resolve([]),
      }),
    }),
    update: () => ({
      set: () => ({
        where: () => ({
          returning: () => Promise.resolve([]),
        }),
      }),
    }),
    delete: () => ({
      where: () => Promise.resolve(),
    }),
  };
}

export { db, pool, mockDB };
export * from "./schema";
