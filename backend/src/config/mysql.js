const mysql = require("mysql2/promise");

let pool;

const connectMySQL = async () => {
  if (!process.env.DATABASE_URL) {
    console.warn("DATABASE_URL is not set. Skipping MySQL connection.");
    return null;
  }

  pool = mysql.createPool(process.env.DATABASE_URL);

  await pool.query("SELECT 1");
  console.log("MySQL connected");

  return pool;
};

const getMySQLPool = () => pool;

module.exports = {
  connectMySQL,
  getMySQLPool,
};
