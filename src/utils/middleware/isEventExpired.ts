import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { HydratedDocument } from "mongoose";
import Event from "../../../models/Event";
import AppError from "../AppError";
import { EventType } from "../types/modelTypes";

export const isEventExpired = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { event_id = "" } = req.params;
    //validate object_id
    if (mongoose.isValidObjectId(event_id)) {
      const event: HydratedDocument<EventType> | null = await Event.findById(event_id);
      if (event) {
        //check if the date of the event has passed the current date, if not return next and continue
        if (new Date(event.date) < new Date(Date.now())) {
          res.status(405).json({ err_message: "Event has expired." });
        }
        return next();
      }
      res.status(404).json({ err_message: "Event not found." });
    } else {
      throw new AppError("Page not found", 404);
    }
  } catch {
    throw new AppError("Page not found", 404);
  }
};
