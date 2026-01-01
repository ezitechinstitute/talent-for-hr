const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

dotenv.config();

const dbName = process.env.DB_NAME;

// ensure database exists (run asynchronously, do not block module export)
mysql
  .createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  })
  .then((connection) => {
    return connection
      .query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`)
      .then(() => {
        console.log(`Database "${dbName}" ensured to exist.`);
        connection.end();
      });
  })
  .catch((err) => {
    console.error("Database ensure failed:", err);
  });

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.getConnection()
  .then((connection) => {
    console.log("Database connected successfully.");
    connection.release();
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });

module.exports = db;
