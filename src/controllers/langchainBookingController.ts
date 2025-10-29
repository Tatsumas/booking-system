import { Request, Response } from "express";
import { CompositeChains } from "../chains/compositeChains.js";
import { Logger } from "../utils/logger.js";

export const reserveWithLangChain = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    Logger.info("LangChain booking request", req.body);

    const bookingChain = CompositeChains.createFullBookingChain();
    const result = await bookingChain.invoke(req.body);

    if (result.success) {
      Logger.info("Booking successful", { booking_id: result.booking_id });
      res.status(201).json(result);
    } else {
      Logger.warn("Booking failed", { error: result.error });
      res.status(400).json(result);
    }
  } catch (error) {
    Logger.error("LangChain booking error", error);
    res.status(500).json({
      success: false,
      error: "Внутренняя ошибка сервера",
    });
  }
};

export const getEventsWithLangChain = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    Logger.info("Fetching events with LangChain");

    const eventChain = CompositeChains.createEventInfoChain();
    const events = await eventChain.invoke(req.query);

    res.json({
      success: true,
      events,
      total: events.length,
    });
  } catch (error) {
    Logger.error("LangChain events error", error);
    res.status(500).json({
      success: false,
      error: "Ошибка получения данных о мероприятиях",
    });
  }
};
