import mongoose from "mongoose";
import { ReviewType } from "../src/utils/types/modelTypes";
const Schema = mongoose.Schema;

const reviewSchema = new Schema<ReviewType>({
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
