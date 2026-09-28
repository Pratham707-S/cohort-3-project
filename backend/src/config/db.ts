import mongoose from 'mongoose';

const MONGO_URI =
  process.env.MONGO_URI ||
  'mongodb+srv://pratham1226667_db_user:C9szgKlGzsK6IWfx@cluster1.dexjfja.mongodb.net/ecommerce_db?retryWrites=true&w=majority';

let cachedPromise: Promise<typeof mongoose> | null = null;

export const connectDB = async (): Promise<typeof mongoose | undefined> => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose;
  }

  if (!cachedPromise) {
    cachedPromise = mongoose.connect(MONGO_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000,
    });
  }

  try {
    return await cachedPromise;
  } catch (error) {
    cachedPromise = null;
    console.error('MongoDB serverless connection error:', error);
    throw error;
  }
};
