import { RunnableSequence } from "@langchain/core/runnables";
import { ValidationChain } from "./validationChain.js";
import { BookingChain } from "./bookingChain.js";
import { client } from "../config/database.js";
import { Logger } from "../utils/logger.js";

export class CompositeChains {
  static createFullBookingChain() {
    return RunnableSequence.from([
      RunnableSequence.from([
        ValidationChain.createValidationChain(),
        BookingChain.createBookingChain(),
      ]),
      BookingChain.createErrorHandlingChain(),

      // Финальное форматирование
      async (result: any) => {
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
    return RunnableSequence.from([
      async (input: { event_id?: number; user_id?: string }) => {
        Logger.info("Fetching events information");

        let query = `
                    SELECT e.*, 
                           COUNT(b.id) as booked_seats,
                           (e.total_seats - COUNT(b.id)) as available_seats
                    FROM events e
                    LEFT JOIN bookings b ON e.id = b.event_id
                `;

        const params: any[] = [];

        if (input.event_id) {
          query += " WHERE e.id = $1";
          params.push(input.event_id);
        }

        query += " GROUP BY e.id ORDER BY e.created_at DESC";

        const result = await client.query(query, params);
        return result.rows;
      },

      async (events: any[]) => {
        Logger.debug("Formatting events data");
        return events.map((event) => ({
          id: event.id,
          name: event.name,
          total_seats: event.total_seats,
          booked_seats: parseInt(event.booked_seats),
          available_seats: parseInt(event.available_seats),
          booking_percentage: Math.round(
            (parseInt(event.booked_seats) / event.total_seats) * 100
          ),
          status:
            parseInt(event.available_seats) > 0 ? "available" : "sold_out",
        }));
      },
    ]);
  }
}
