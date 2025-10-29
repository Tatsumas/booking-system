import { z } from "zod";

export const BookingSchema = z.object({
  event_id: z.number().int().positive(),
  user_id: z.string().min(1).max(255),
  seats: z.number().int().min(1).max(10).optional().default(1),
});

export const EventSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(255),
  total_seats: z.number().int().positive(),
  created_at: z.date(),
});

export type Booking = z.infer<typeof BookingSchema>;
export type Event = z.infer<typeof EventSchema>;
export type BookingResponse = {
  success: boolean;
  message?: string;
  booking?: any;
  error?: string;
  available_seats?: number;
};
