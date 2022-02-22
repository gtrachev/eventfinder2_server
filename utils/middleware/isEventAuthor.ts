import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import Event from "../../models/Event";
import AppError from "../AppError";

const isEventAuthor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { event_id } = req.params;
    //validate object_id
    if (mongoose.isValidObjectId(event_id)) {
      const event = await Event.findById(event_id).populate("author");
      //check if user is event author, if yes return next and continue
      if (event) {
        if (event.author.equals(req.user)) {
          return next();
        }
        return res.status(401).json({ err_message: "Not owner of the event." });
      }
      res.status(404).json({ err_message: "Event not found." });
    } else {
      throw new AppError("Page not found", 404);
    }
  } catch {
    throw new AppError("Page not found", 404);
  }
};

export default isEventAuthor;
