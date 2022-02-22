require("dotenv").config();
import mongoose from "mongoose";
const Schema = mongoose.Schema;
import passportLocalMongoose from "passport-local-mongoose";
import { ImageType, UserType } from "../utils/types/modelTypes";
import { UserTiersEnum } from "../utils/types/userTiers";

const profileImgSchema = new Schema<ImageType>({
  path: { type: String, required: true },
  filename: { type: String, required: true },
});

export const userSchema = new Schema<UserType>({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  userTier: {
    type: String,
    enum: UserTiersEnum,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  profileImage: {
    type: profileImgSchema,
    default: {
      path: process.env.DEFAULT_PROFILE_IMG_PATH as string,
      filename: "default2_p4x4kn",
    },
  },
  date: {
    type: Date,
    default: Date.now(),
  },
  attending: {
    type: [Schema.Types.ObjectId],
    ref: "Event",
  },
  following: {
    type: [Schema.Types.ObjectId],
    ref: "User",
  },
  followers: {
    type: [Schema.Types.ObjectId],
    ref: "User",
  },
  country: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  interests: {
    type: [String],
    minlength: 1,
  },
  inChats: {
    type: [Schema.Types.ObjectId],
    ref: "Chat",
    required: false,
  },
  savedEvents: {
    type: [Schema.Types.ObjectId],
    ref: "Event",
    required: false,
  },
  likedNotes: {
    type: [Schema.Types.ObjectId],
    ref: "Note",
    required: false,
  },
  lastPosted: {
    type: Date,
    required: false,
  },
});
//plugin passport local mongoose to schema
userSchema.plugin(passportLocalMongoose);

const User: any = mongoose.model("User", userSchema);
export default User;
