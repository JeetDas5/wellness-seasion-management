import mongoose from "mongoose";

const URI = process.env.MONGO_URI as string;

if (!URI) {
  throw new Error("Database URL is not defined.");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cachedConnection = (global as any).mongoose || {
  conn: null,
  promise: null,
};

export async function connectDB() {
  if (cachedConnection.conn) {
    return cachedConnection.conn;
  }
  if (!cachedConnection.promise) {
    cachedConnection.promise = mongoose.connect(URI, {
      bufferCommands: false,
    });
  }
  cachedConnection.conn = await cachedConnection.promise;
  return cachedConnection.conn;
}