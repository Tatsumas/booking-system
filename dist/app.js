"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_js_1 = require("./config/database.js");
const langchainBookingController_js_1 = require("./controllers/langchainBookingController.js");
const logger_js_1 = require("./utils/logger.js");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.post("/api/bookings/reserve", langchainBookingController_js_1.reserveWithLangChain);
app.get("/api/events", langchainBookingController_js_1.getEventsWithLangChain);
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
const startServer = async () => {
    try {
        await (0, database_js_1.connectDB)();
        app.listen(PORT, () => {
            logger_js_1.Logger.info(`Server running on port ${PORT}`);
            logger_js_1.Logger.info(`Environment: ${process.env.NODE_ENV}`);
            logger_js_1.Logger.info(`Health check: http://localhost:${PORT}/health`);
        });
    }
    catch (error) {
        logger_js_1.Logger.error("Failed to start server", error);
        process.exit(1);
    }
};
// Graceful shutdown
process.on("SIGINT", async () => {
    logger_js_1.Logger.info("Shutting down gracefully...");
    process.exit(0);
});
startServer();
//# sourceMappingURL=app.js.map