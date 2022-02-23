import { Request, Response } from "express";
import mongoose, { HydratedDocument } from "mongoose";
import { EventType, ReviewType, UserRequest } from "../utils/types/modelTypes";
import Event from "../models/Event";
import Review from "../models/Review";
import AppError from "../utils/AppError";

//POST - /api/reviews/create/:event_id
//create review
export const createReview = async (req: UserRequest, res: Response) => {
  try {
    const { event_id } = req.params;
    //validate object_id
    if (mongoose.isValidObjectId(event_id)) {
      const event: HydratedDocument<EventType> | null = await Event.findById(event_id);
      if (event) {
        const reviewData = req.body;
        //create review
        const newReview = new Review(reviewData);
        //assign review author
        newReview.author = req.user._id;
        await newReview.save();
        await event.updateOne({ $push: { reviews: newReview._id } });
        return res.status(200).json({ newReview });
      }
      res.status(500).json({ message: "No such event." });
    } else {
      throw new AppError("Page not found", 404);
    }
  } catch (err) {
    throw new AppError("Page not found", 404);
  }
};

//DELETE - /api/reviews/delete/:review_id
//delete review
export const deleteReview = async (req: Request, res: Response) => {
  try {
    const { review_id } = req.params;
    //validate object_id
    if (mongoose.isValidObjectId(review_id)) {
      //delete review
      const deletedReview: HydratedDocument<ReviewType> | null =
        await Review.findByIdAndDelete(review_id);
      if (deletedReview) {
        return res.status(200).json({ deletedReview });
      }
      res.status(500).json({ message: "No such review." });
    } else {
      throw new AppError("Page not found", 404);
    }
  } catch (err) {
    throw new AppError("Page not found", 404);
  }
};
