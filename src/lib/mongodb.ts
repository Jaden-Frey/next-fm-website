import mongoose, { Mongoose } from "mongoose";

const MONGODB_URL = process.env.MONGODB_URL; 

// connection cache shape
interface MongooseConn {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
  dbName?: string | null;
}

// Attach cache to globalThis so it survives HMR / warm containers
declare global {
  var __mongoose_cache__: MongooseConn | undefined;
}

// initialize (preserve your original pattern but make it resilient)
let cached: MongooseConn = (global as any).__mongoose_cache__ as MongooseConn;

if (!cached) {
  cached = (global as any).__mongoose_cache__ = {
    conn: null,
    promise: null,
    dbName: null,
  };
}

export const connect = async (dbName = "clerk-db"): Promise<Mongoose> => {
  if (!MONGODB_URL) {
    throw new Error("Missing MONGODB_URL environment variable");
  }

  // If already connected to the same DB, return immediately
  if (cached.conn) {
    if (!dbName || cached.dbName === dbName) {
      return cached.conn;
    }
  }

  if (cached.promise) {
    await cached.promise;
    if (cached.conn) return cached.conn;
  }

  // Create and cache connection promise (so concurrent callers reuse it)
  cached.promise =
    cached.promise ||
    mongoose
      .connect(MONGODB_URL, {
        dbName,
        bufferCommands: false,
        connectTimeoutMS: 30000,
      })
      .then(() => {
        cached.conn = mongoose;
        cached.dbName = dbName;
        cached.promise = null;
        console.log(`[mongo] connected to ${dbName}`);
        return mongoose;
      })
      .catch((err) => {
        cached.conn = null;
        cached.promise = null;
        cached.dbName = null;
        console.error("[mongo] connect error:", err);
        throw err;
      });

  await cached.promise;
  if (!cached.conn) {
    throw new Error("Failed to establish mongoose connection");
  }
  return cached.conn;
};

export default connect;