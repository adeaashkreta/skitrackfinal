require("dotenv").config();

const app = require("./app");
const connectMongo = require("./config/mongo");
const { connectMySQL } = require("./config/mysql");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectMySQL();
    await connectMongo();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
