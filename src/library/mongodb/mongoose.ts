import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

const connect = async () => {
  // 1. Check if the connection state is already "open" (1)
  if (mongoose.connection.readyState === 1) {
    console.log('MongoDB already connected');
    return;
  }

  // 2. TypeScript check: Ensure the URI actually exists
  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
  }

  try {
    // 3. Connect (No need for useNewUrlParser/useUnifiedTopology in Mongoose 7+)
    await mongoose.connect(MONGODB_URI, {
      dbName: 'fm website', // Change this to your actual DB name
      bufferCommands: true,
    });

    console.log('MongoDB connected');
  } catch (error) {
    console.log('MongoDB connection error:', error);
    throw new Error('Error connecting to database');
  }
};

export default connect;