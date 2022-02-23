import mongoose, { HydratedDocument } from "mongoose";
import { ReviewType } from "../utils/types/modelTypes";
const Schema = mongoose.Schema;

const reviewSchema = new Schema<HydratedDocument<ReviewType>>({
  text: {
    type: String,
    required: true,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  postedDate: {
    type: Date,
    default: Date.now(),
  },
});

const Review = mongoose.model("Review", reviewSchema);
export default Review;
