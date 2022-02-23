"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const ChatSchema = new Schema({
    type: {
        type: String,
        required: true,
    },
    members: {
        type: [Schema.Types.ObjectId],
        ref: "User",
    },
    messages: {
        type: [Schema.Types.ObjectId],
        ref: "Message",
    },
    event: {
        type: Schema.Types.ObjectId,
        ref: "Event",
    },
}, { timestamps: true });
const Chat = mongoose_1.default.model("Chat", ChatSchema);
exports.default = Chat;
