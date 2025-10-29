import { Client } from "pg";
import dotenv from "dotenv";
import { Logger } from "../utils/logger.js";
dotenv.config();

const client = new Client({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "booking_system",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD,
});

export const connectDB = async (): Promise<void> => {
  try {
    await client.connect();
    Logger.info("Connected to PostgreSQL database");
  } catch (error) {
    Logger.error("Database connection error:", error);
    process.exit(1);
  }
};

export { client };
