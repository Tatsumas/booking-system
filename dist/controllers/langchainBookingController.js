"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEventsWithLangChain = exports.reserveWithLangChain = void 0;
const compositeChains_js_1 = require("../chains/compositeChains.js");
const logger_js_1 = require("../utils/logger.js");
const reserveWithLangChain = async (req, res) => {
    try {
        logger_js_1.Logger.info("LangChain booking request", req.body);
        const bookingChain = compositeChains_js_1.CompositeChains.createFullBookingChain();
        const result = await bookingChain.invoke(req.body);
        if (result.success) {
            logger_js_1.Logger.info("Booking successful", { booking_id: result.booking_id });
            res.status(201).json(result);
        }
        else {
            logger_js_1.Logger.warn("Booking failed", { error: result.error });
            res.status(400).json(result);
        }
    }
    catch (error) {
        logger_js_1.Logger.error("LangChain booking error", error);
        res.status(500).json({
            success: false,
            error: "Внутренняя ошибка сервера",
        });
    }
};
exports.reserveWithLangChain = reserveWithLangChain;
const getEventsWithLangChain = async (req, res) => {
    try {
        logger_js_1.Logger.info("Fetching events with LangChain");
        const eventChain = compositeChains_js_1.CompositeChains.createEventInfoChain();
        const events = await eventChain.invoke(req.query);
        res.json({
            success: true,
            events,
            total: events.length,
        });
    }
    catch (error) {
        logger_js_1.Logger.error("LangChain events error", error);
        res.status(500).json({
            success: false,
            error: "Ошибка получения данных о мероприятиях",
        });
    }
};
exports.getEventsWithLangChain = getEventsWithLangChain;
//# sourceMappingURL=langchainBookingController.js.map