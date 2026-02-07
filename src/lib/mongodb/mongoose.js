import mongoose from "mongoose";

let initialized = false;

export const connect = async () => {
  mongoose.set("strictQuery", true); 

  if (initialized) {
    console.log("MongoDB is already connected.");
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "mywebsite",
      useNewUrlParser: true,
      useUnifiedTopology: true,
  });
  console.log("MongoDB connected successfully.");
  initialized = true;


  } catch (error) {
    console.log("MongoDB connection error:", error);
  }

}


