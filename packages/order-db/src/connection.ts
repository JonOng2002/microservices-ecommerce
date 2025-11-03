import mongoose from "mongoose";

let isConnected = false;

export const connectOrderDB = async () => {
  if (isConnected) return;

  if (!process.env.MONGO_URL) {
    throw new Error("MONGO_URL is not defined in env file!");
  }

  try {
    // Support DocumentDB SSL configuration via environment variable
    // For DocumentDB, MONGO_URL should include ?ssl=true
    // For local MongoDB, no SSL needed
    const connectionOptions: mongoose.ConnectOptions = {};
    
    // If using DocumentDB and SSL is required, Mongoose will use SSL from connection string
    // DocumentDB connection string typically includes ?ssl=true&sslCAFile=...
    // For local development, connection string doesn't include SSL
    
    await mongoose.connect(process.env.MONGO_URL, connectionOptions);
    isConnected = true;
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log(error);
    throw error;
  }
};
