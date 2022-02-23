import mongoose, { HydratedDocument } from "mongoose";
import {
  AgeGroupEnum,
  EventType,
  ImageType,
  MessageType,
  ReviewType,
} from "../utils/types/modelTypes";
import Chat from "./Chat";
import Message from "./Message";
import Review from "./Review";
const Schema = mongoose.Schema;

const imageSchema = new Schema<ImageType>({
  filename: String,
  path: String,
});

const eventSchema = new Schema<EventType>({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  attenders: {
    type: [Schema.Types.ObjectId],
    ref: "User",
  },
  geometry: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  reviews: {
    type: [Schema.Types.ObjectId],
    ref: "Review",
  },
  images: [imageSchema],
  address: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: new Date(Date.now()),
    required: true,
  },
  interestCategories: {
    type: [String],
    minlength: 1,
  },
  ageGroup: {
    type: String,
    enum: AgeGroupEnum,
    required: true,
  },
  chat: {
    type: Schema.Types.ObjectId,
    ref: "Chat",
  },
});

//delete reviews, messages and images from deleted event
eventSchema.post("findOneAndDelete", async (deletedEvent) => {
  await Chat.findByIdAndDelete(deletedEvent.chat);
  const reviews: [HydratedDocument<ReviewType>] | null = await Review.find({
    event: deletedEvent._id,
  }).populate("author");
  if (reviews) {
    reviews.forEach(async (review: ReviewType) => {
      await Review.deleteOne({ _id: review._id });
    });
  }
  const messages: [HydratedDocument<MessageType>] | null = await Message.find({
    event: deletedEvent._id,
  });
  if (messages) {
    messages.forEach(async (msg) => {
      await Message.deleteOne({ _id: msg._id });
    });
  }
});

const Event = mongoose.model("Event", eventSchema);
export default Event;
