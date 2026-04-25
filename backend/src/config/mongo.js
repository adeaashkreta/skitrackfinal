const mongoose = require("mongoose");

const connectMongo = async () => {
  if (!process.env.MONGO_URL) {
    console.warn("MONGO_URL is not set. Skipping MongoDB connection.");
    return null;
  }

  await mongoose.connect(process.env.MONGO_URL);
  console.log("MongoDB connected");

  return mongoose.connection;
};

module.exports = connectMongo;
