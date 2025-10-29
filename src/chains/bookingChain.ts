import { RunnableSequence } from "@langchain/core/runnables";
import { client } from "../config/database.js";
import { Logger } from "../utils/logger.js";

export class BookingChain {
  static createBookingChain() {
    return RunnableSequence.from([
      async (input: any) => {
        Logger.info("Checking event availability", {
          event_id: input.event_id,
        });
        const event = await client.query("SELECT * FROM events WHERE id = $1", [
          input.event_id,
        ]);

        if (event.rows.length === 0) {
          throw new Error("EVENT_NOT_FOUND");
        }
        return { ...input, event: event.rows[0] };
      },

      async (input: any) => {
        Logger.debug("Checking for duplicate bookings");
        const existing = await client.query(
          "SELECT * FROM bookings WHERE event_id = $1 AND user_id = $2",
          [input.event_id, input.user_id]
        );

        if (existing.rows.length > 0) {
          throw new Error("DUPLICATE_BOOKING");
        }
        return input;
      },

      async (input: any) => {
        Logger.debug("Checking available seats");
        const booked = await client.query(
          "SELECT COUNT(*) as count FROM bookings WHERE event_id = $1",
          [input.event_id]
        );

        const bookedCount = parseInt(booked.rows[0].count);
        const availableSeats = input.event.total_seats - bookedCount;

        if (availableSeats < input.seats) {
          throw new Error("NO_AVAILABLE_SEATS");
        }

        return { ...input, availableSeats, bookedCount };
      },

      async (input: any) => {
        Logger.info("Creating booking", {
          event_id: input.event_id,
          user_id: input.user_id,
        });

        await client.query("BEGIN");

        try {
          const booking = await client.query(
            `INSERT INTO bookings (event_id, user_id, created_at) 
                         VALUES ($1, $2, NOW()) RETURNING *`,
            [input.event_id, input.user_id]
          );

          await client.query("COMMIT");

          return {
            success: true,
            booking: booking.rows[0],
            event: input.event,
            availableSeats: input.availableSeats - input.seats,
          };
        } catch (error) {
          await client.query("ROLLBACK");
          throw error;
        }
      },
    ]);
  }

  static createErrorHandlingChain() {
    // Создаем две функции вместо одной
    const passThrough = (input: any) => input;

    const errorHandler = async (input: any) => {
      try {
        return await input;
      } catch (error: any) {
        Logger.error("Error in booking chain", error);

        const errorMap: { [key: string]: string } = {
          EVENT_NOT_FOUND: "Мероприятие не найдено",
          DUPLICATE_BOOKING: "Вы уже забронировали",
          NO_AVAILABLE_SEATS: "Все места заняты",
          MISSING_REQUIRED_FIELDS:
            "Отсутствуют обязательные поля: event_id и user_id",
          MAX_SEATS_EXCEEDED: "Нельзя забронировать больше 10 мест",
        };

        return {
          success: false,
          error: errorMap[error.message] || "Ошибка при бронировании",
          error_code: error.message,
        };
      }
    };

    // Теперь передаем 2 функции
    return RunnableSequence.from([passThrough, errorHandler]);
  }
}
