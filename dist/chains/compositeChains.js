"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompositeChains = void 0;
const runnables_1 = require("@langchain/core/runnables");
const validationChain_js_1 = require("./validationChain.js");
const bookingChain_js_1 = require("./bookingChain.js");
const database_js_1 = require("../config/database.js");
const logger_js_1 = require("../utils/logger.js");
class CompositeChains {
    static createFullBookingChain() {
        return runnables_1.RunnableSequence.from([
            runnables_1.RunnableSequence.from([
                validationChain_js_1.ValidationChain.createValidationChain(),
                bookingChain_js_1.BookingChain.createBookingChain(),
            ]),
            bookingChain_js_1.BookingChain.createErrorHandlingChain(),
            // Финальное форматирование
            async (result) => {
                if (result.success) {
                    return {
                        success: true,
                        message: `Бронирование подтверждено: ${result.event.name}`,
                        booking_id: result.booking.id,
                        user_id: result.booking.user_id,
                        event_name: result.event.name,
                        available_seats: result.availableSeats,
                        created_at: result.booking.created_at,
                    };
                }
                return result;
            },
        ]);
    }
    static createEventInfoChain() {
        return runnables_1.RunnableSequence.from([
            async (input) => {
                logger_js_1.Logger.info("Fetching events information");
                let query = `
                    SELECT e.*, 
                           COUNT(b.id) as booked_seats,
                           (e.total_seats - COUNT(b.id)) as available_seats
                    FROM events e
                    LEFT JOIN bookings b ON e.id = b.event_id
                `;
                const params = [];
                if (input.event_id) {
                    query += " WHERE e.id = $1";
                    params.push(input.event_id);
                }
                query += " GROUP BY e.id ORDER BY e.created_at DESC";
                const result = await database_js_1.client.query(query, params);
                return result.rows;
            },
            async (events) => {
                logger_js_1.Logger.debug("Formatting events data");
                return events.map((event) => ({
                    id: event.id,
                    name: event.name,
                    total_seats: event.total_seats,
                    booked_seats: parseInt(event.booked_seats),
                    available_seats: parseInt(event.available_seats),
                    booking_percentage: Math.round((parseInt(event.booked_seats) / event.total_seats) * 100),
                    status: parseInt(event.available_seats) > 0 ? "available" : "sold_out",
                }));
            },
        ]);
    }
}
exports.CompositeChains = CompositeChains;
//# sourceMappingURL=compositeChains.js.map