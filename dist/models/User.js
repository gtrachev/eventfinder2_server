"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userSchema = void 0;
require("dotenv").config();
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const passport_local_mongoose_1 = __importDefault(require("passport-local-mongoose"));
const userTiers_1 = require("../utils/types/userTiers");
const profileImgSchema = new Schema({
    path: { type: String, required: true },
    filename: { type: String, required: true },
});
exports.userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    userTier: {
        type: String,
        enum: userTiers_1.UserTiersEnum,
        required: true,
    },
    age: {
        type: Number,
        required: true,
    },
    profileImage: {
        type: profileImgSchema,
        default: {
            path: process.env.DEFAULT_PROFILE_IMG_PATH,
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
exports.userSchema.plugin(passport_local_mongoose_1.default);
const User = mongoose_1.default.model("User", exports.userSchema);
exports.default = User;
