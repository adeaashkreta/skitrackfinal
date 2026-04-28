require("dotenv").config();

const app = require("./app");
const connectMongo = require("./config/mongo");
const { connectMySQL } = require("./config/mysql");

const PORT = process.env.PORT || 5174;

const startServer = async () => {
  try {
    await connectMySQL();
    await connectMongo();

    app.listen(PORT, "127.0.0.1", () => {
      console.log(`Server running at http://127.0.0.1:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();