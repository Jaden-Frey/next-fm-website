import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

const connect = async () => {
  if (mongoose.connection.readyState === 1) {
    console.log('✅ MongoDB already connected');
    return;
  }

  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in environment variables');
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: 'fm-website',
      bufferCommands: true,
    });

    console.log('✅ MongoDB connected successfully to database: fm-website');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw new Error('Error connecting to database');
  }
};

export default connect;