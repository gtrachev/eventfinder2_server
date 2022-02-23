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
const Note_1 = __importDefault(require("../../models/Note"));
const AppError_1 = __importDefault(require("../AppError"));
const isNoteAuthor = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { note_id = "" } = req.params;
        //validate object_id
        if (mongoose_1.default.isValidObjectId(note_id)) {
            const note = yield Note_1.default.findById(note_id).populate("author");
            if (note) {
                //chek if user is note author
                if (note.author === req.user) {
                    return next();
                }
                return res.status(401).json({ message: "Not owner of the note." });
            }
            res.status(401).json({ message: "No note found." });
        }
        else {
            throw new AppError_1.default("Page not found", 404);
        }
    }
    catch (_a) {
        throw new AppError_1.default("Page not found", 404);
    }
});
exports.default = isNoteAuthor;
