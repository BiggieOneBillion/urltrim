// lib/db.ts
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/url-shortener";

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

//let cached = global.mongoose;
let cached: {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
} = (global as any).mongoose;
// if (!cached) {
//   cached = global.mongoose = { conn: null, promise: null };
// }
if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: true
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then(mongoose => {
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
