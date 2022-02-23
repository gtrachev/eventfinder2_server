import { Request } from "express";
import { ObjectId } from "mongoose";
import { InterestEnum } from "./interestTypes";
import { UserTiersEnum } from "./userTiers";

export enum AgeGroupEnum {
  all = "all",
  over = "over",
}

export interface UserRequest extends Request {
  user: UserType;
  files: any;
}

export interface UserType {
  _id: ObjectId;
  username: string;
  email: string;
  password: string;
  userTier: UserTiersEnum;
  age: number;
  profileImage: ProfileImage;
  date?: Date;
  attending: ObjectId[];
  following: ObjectId[];
  followers: ObjectId[];
  country: string;
  city: string;
  interests: InterestEnum[];
  inChats: ObjectId[];
  savedEvents: ObjectId[];
  likedNotes: ObjectId[];
  lastPosted: Date;
}

export interface UserInputType {
  username: string;
  email: string;
  password: string;
  age: number;
  country: string;
  city: string;
  interests: InterestEnum[];
}

export interface EventType {
  _id: ObjectId;
  name: string;
  price: number;
  description: string;
  geometry: {
    type: "Point";
    coordinates: number[];
  };
  images: ImageType[];
  attenders: ObjectId[];
  reviews: ObjectId[];
  address: string;
  country: string;
  city: string;
  author: ObjectId;
  date: Date;
  time: string;
  created_at: Date;
  interestCategories: InterestEnum[];
  ageGroup: AgeGroupEnum;
  chat: ChatType;
}

export interface EventInputType {
  name: string;
  price: number;
  description: string;
  address: string;
  date: Date;
  time: string;
  interestCategories: InterestEnum[];
  ageGroup: "all" | "over";
}

export interface NoteType {
  _id: ObjectId;
  body: string;
  author: ObjectId;
  shared_event?: ObjectId;
  created_at: Date;
  likedBy: ObjectId[];
}
export interface NoteInputType {
  body: string;
  shared_event?: ObjectId;
}

export interface ChatType {
  _id: ObjectId;
  type: string;
  members: ObjectId[];
  messages: ObjectId[];
  createdAt: Date;
  event?: ObjectId;
}

export interface MessageType {
  _id: ObjectId;
  chat: ObjectId;
  text: string;
  author: ObjectId;
  createdAt: Date;
}

export interface MessageInputType {
  text: string;
}

export interface ReviewType {
  _id: ObjectId;
  text: string;
  author: ObjectId;
  postedDate?: Date;
}

export interface ReviewInputType {
  text: string;
  //   time: string;
}

export interface ProfileImage {
  path: string;
  filename: string;
}

export interface ImageType {
  filename: string;
  path: string;
}
