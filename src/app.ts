import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { connectDB } from "./config/database.js";
import {
  reserveWithLangChain,
  getEventsWithLangChain,
} from "./controllers/langchainBookingController.js";
import { Logger } from "./utils/logger.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.post("/api/bookings/reserve", reserveWithLangChain);
app.get("/api/events", getEventsWithLangChain);

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: "1.0.0",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Маршрут не найден",
  });
});

// Start server
const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      Logger.info(`Server running on port ${PORT}`);
      Logger.info(`Environment: ${process.env.NODE_ENV}`);
      Logger.info(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    Logger.error("Failed to start server", error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on("SIGINT", async () => {
  Logger.info("Shutting down gracefully...");
  process.exit(0);
});

startServer();
