"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.noteSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
exports.noteSchema = new Schema({
    body: {
        type: String,
        required: true,
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    created_at: {
        type: Date,
        default: new Date(Date.now()),
    },
    shared_event: {
        type: Schema.Types.ObjectId,
        ref: "Event",
        required: false,
    },
    likedBy: {
        type: [Schema.Types.ObjectId],
        ref: "User",
    },
});
const Note = mongoose_1.default.model("Note", exports.noteSchema);
exports.default = Note;
