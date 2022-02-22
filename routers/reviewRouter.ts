import express, { Request, Response, NextFunction } from "express";
import asyncWrap from "../utils/asyncWrap";
import { reviewJoiSchema } from "../utils/joi/joiSchemas";
import isLoggedIn from "../utils/middleware/isLoggedIn";
import { validateBodyData } from "../utils/middleware/joiValidators";
import * as reviewController from "../controllers/reviewController";
import isReviewAuthor from "../utils/middleware/isReviewAuthor";
import { isEventExpired } from "../utils/middleware/isEventExpired";
const reviewsRouter = express.Router();

//POST - /api/reviews/create/:event_id
//create review
reviewsRouter.post(
  "/create/:event_id",
  isLoggedIn,
  isEventExpired,
  (req: Request, res: Response, next: NextFunction) =>
    validateBodyData(reviewJoiSchema, req, res, next),
  asyncWrap(reviewController.createReview)
);

//DELETE - /api/reviews/delete/:review_id
//delete review
reviewsRouter.delete(
  "/delete/:review_id",
  isLoggedIn,
  isReviewAuthor,
  asyncWrap(reviewController.deleteReview)
);

export default reviewsRouter;
