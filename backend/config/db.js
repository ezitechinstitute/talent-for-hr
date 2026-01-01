import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const dbName = process.env.DB_NAME;

const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// create database if it doesn't exist
await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
console.log(`Database "${dbName}" ensured to exist.`);

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

export default db;
