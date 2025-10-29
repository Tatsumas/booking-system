"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventSchema = exports.BookingSchema = void 0;
const zod_1 = require("zod");
exports.BookingSchema = zod_1.z.object({
    event_id: zod_1.z.number().int().positive(),
    user_id: zod_1.z.string().min(1).max(255),
    seats: zod_1.z.number().int().min(1).max(10).optional().default(1),
});
exports.EventSchema = zod_1.z.object({
    id: zod_1.z.number().int().positive(),
    name: zod_1.z.string().min(1).max(255),
    total_seats: zod_1.z.number().int().positive(),
    created_at: zod_1.z.date(),
});
//# sourceMappingURL=types.js.map