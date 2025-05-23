import mongoose from "mongoose";

const mongodbURL = process.env.DB_URL;
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose
      .connect(mongodbURL, opts)
      .then((mongoose) => {
        console.log("DB Connected");
        return mongoose;
      })
      .catch((err) => {
        console.log("💀 DATABASE CONNECTION ERROR", err);
      });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
