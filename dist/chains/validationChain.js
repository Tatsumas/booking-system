"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationChain = void 0;
const runnables_1 = require("@langchain/core/runnables");
const types_js_1 = require("../types/types.js");
const logger_js_1 = require("../utils/logger.js");
class ValidationChain {
    static createValidationChain() {
        return runnables_1.RunnableSequence.from([
            (input) => {
                logger_js_1.Logger.debug("Validating input structure");
                if (!input.event_id || !input.user_id) {
                    throw new Error("MISSING_REQUIRED_FIELDS");
                }
                return input;
            },
            (input) => {
                logger_js_1.Logger.debug("Type conversion");
                return {
                    event_id: Number(input.event_id),
                    user_id: String(input.user_id).trim(),
                    seats: input.seats ? Number(input.seats) : 1,
                };
            },
            async (input) => {
                logger_js_1.Logger.debug("Zod validation");
                return types_js_1.BookingSchema.parseAsync(input);
            },
            async (validatedInput) => {
                logger_js_1.Logger.debug("Business rules validation");
                if (validatedInput.seats > 10) {
                    throw new Error("MAX_SEATS_EXCEEDED");
                }
                return validatedInput;
            },
        ]);
    }
}
exports.ValidationChain = ValidationChain;
//# sourceMappingURL=validationChain.js.map