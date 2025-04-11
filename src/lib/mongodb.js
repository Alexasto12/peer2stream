import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI;
const clientOptions = {
    serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true
    }
};

// Cache the database connection
let cached = global.mongoose;
if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(uri, clientOptions)
            .then(mongoose => {
                console.log("Connected to MongoDB!");
                return mongoose;
            });
    }
    
    cached.conn = await cached.promise;
    return cached.conn;
}