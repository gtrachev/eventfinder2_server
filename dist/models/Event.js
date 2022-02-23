"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const modelTypes_1 = require("../utils/types/modelTypes");
const Chat_1 = __importDefault(require("./Chat"));
const Message_1 = __importDefault(require("./Message"));
const Review_1 = __importDefault(require("./Review"));
const Schema = mongoose_1.default.Schema;
const imageSchema = new Schema({
    filename: String,
    path: String,
});
const eventSchema = new Schema({
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
        enum: modelTypes_1.AgeGroupEnum,
        required: true,
    },
    chat: {
        type: Schema.Types.ObjectId,
        ref: "Chat",
    },
});
//delete reviews, messages and images from deleted event
eventSchema.post("findOneAndDelete", (deletedEvent) => __awaiter(void 0, void 0, void 0, function* () {
    yield Chat_1.default.findByIdAndDelete(deletedEvent.chat);
    const reviews = yield Review_1.default.find({
        event: deletedEvent._id,
    }).populate("author");
    if (reviews) {
        reviews.forEach((review) => __awaiter(void 0, void 0, void 0, function* () {
            yield Review_1.default.deleteOne({ _id: review._id });
        }));
    }
    const messages = yield Message_1.default.find({
        event: deletedEvent._id,
    });
    if (messages) {
        messages.forEach((msg) => __awaiter(void 0, void 0, void 0, function* () {
            yield Message_1.default.deleteOne({ _id: msg._id });
        }));
    }
}));
const Event = mongoose_1.default.model("Event", eventSchema);
exports.default = Event;
