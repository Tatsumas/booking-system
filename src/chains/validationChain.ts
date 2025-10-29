import { RunnableSequence } from "@langchain/core/runnables";
import { BookingSchema } from "../types/types.js";
import { Logger } from "../utils/logger.js";

export class ValidationChain {
  static createValidationChain() {
    return RunnableSequence.from([
      (input: any) => {
        Logger.debug("Validating input structure");
        if (!input.event_id || !input.user_id) {
          throw new Error("MISSING_REQUIRED_FIELDS");
        }
        return input;
      },

      (input: any) => {
        Logger.debug("Type conversion");
        return {
          event_id: Number(input.event_id),
          user_id: String(input.user_id).trim(),
          seats: input.seats ? Number(input.seats) : 1,
        };
      },

      async (input: any) => {
        Logger.debug("Zod validation");
        return BookingSchema.parseAsync(input);
      },

      async (validatedInput: any) => {
        Logger.debug("Business rules validation");
        if (validatedInput.seats > 10) {
          throw new Error("MAX_SEATS_EXCEEDED");
        }
        return validatedInput;
      },
    ]);
  }
}
