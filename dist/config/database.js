"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = exports.connectDB = void 0;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
const logger_js_1 = require("../utils/logger.js");
dotenv_1.default.config();
const client = new pg_1.Client({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    database: process.env.DB_NAME || "booking_system",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD,
});
exports.client = client;
const connectDB = async () => {
    try {
        await client.connect();
        logger_js_1.Logger.info("Connected to PostgreSQL database");
    }
    catch (error) {
        logger_js_1.Logger.error("Database connection error:", error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
//# sourceMappingURL=database.js.map