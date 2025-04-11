import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('Please define MONGODB_URI environment variable');
}

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      serverSelectionTimeoutMS: 5000,
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(uri, opts)
      .then(mongoose => {
        console.log("✅ Connected to MongoDB successfully");
        return mongoose;
      })
      .catch(err => {
        console.error("❌ MongoDB connection error:", err.message);
        throw err;
      });
  }
  
  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    console.error("❌ Failed to resolve MongoDB connection:", error.message);
    throw error;
  }
}