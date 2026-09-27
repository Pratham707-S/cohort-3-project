import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  try {
    const mongoUri =
      process.env.MONGO_URI ||
      'mongodb+srv://pratham1226667_db_user:C9szgKlGzsK6IWfx@cluster1.dexjfja.mongodb.net/ecommerce_db?retryWrites=true&w=majority';
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log('MongoDB Connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};
