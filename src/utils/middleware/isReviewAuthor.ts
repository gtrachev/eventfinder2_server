import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import Review from "../../models/Review";
import AppError from "../AppError";

const isReviewAuthor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { review_id = "" } = req.params;
    //validate object_id
    if (mongoose.isValidObjectId(review_id)) {
      const review = await Review.findById(review_id).populate("author");
      if (review) {
        if (review.author === req.user) {
          return next();
        }
        return res
          .status(401)
          .json({ err_message: "Not owner of the review." });
      }
      res.status(404).json({ err_message: "Review not found." });
    } else {
      throw new AppError("Page not found", 404);
    }
  } catch {
    throw new AppError("Page not found", 404);
  }
};

export default isReviewAuthor;
