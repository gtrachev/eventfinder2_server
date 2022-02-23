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
exports.handleLike = exports.deleteNote = exports.createNote = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Note_1 = __importDefault(require("../models/Note"));
const User_1 = __importDefault(require("../models/User"));
const AppError_1 = __importDefault(require("../utils/AppError"));
//POST - /api/notes/create
//create note
const createNote = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { body, shared_event } = req.body;
    //check if note includes a shared event
    const noteData = shared_event.length
        ? {
            body,
            shared_event,
        }
        : { body };
    //create note
    const note = new Note_1.default(noteData);
    //assign note author
    note.author = req.user._id;
    yield note.save();
    res.status(200).json({ note });
});
exports.createNote = createNote;
//DELETE - api/notes/delete/note_id
//delete note
const deleteNote = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { note_id } = req.params;
        //validate object_id
        if (mongoose_1.default.isValidObjectId(note_id)) {
            //delete note
            const deletedNote = yield Note_1.default.findByIdAndDelete(note_id);
            if (deletedNote) {
                return res.status(200).json({ deletedNote });
            }
            res.status(200).json({ message: "No such note." });
        }
        else {
            throw new AppError_1.default("Page not found", 404);
        }
    }
    catch (_a) {
        throw new AppError_1.default("Page not found.", 404);
    }
});
exports.deleteNote = deleteNote;
//GET - api/notes/like/note_id
//handle like
const handleLike = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { note_id } = req.params;
        if (mongoose_1.default.isValidObjectId(note_id)) {
            const note = yield Note_1.default.findById(note_id).populate("likedBy");
            if (note) {
                const user = yield User_1.default.findById(req.user._id);
                //check if user has liked the note, if yes, unlike, else like
                if (note.likedBy.find((userLiked) => userLiked._id === user._id)) {
                    //pull current user from note likedBy field
                    yield note.updateOne({ $pull: { likedBy: req.user._id } }, { upsert: true });
                    //pull unliked note form user's likedNotes field
                    yield user.updateOne({ $pull: { likedNotes: note._id } }, { upsert: true });
                    return res
                        .status(200)
                        .json({ unlikedBy: req.user, unlikedNote: note });
                }
                //push current user to note likedBy field
                yield note.updateOne({ $push: { likedBy: req.user._id } }, { upsert: true });
                //push liked note to user's likedNotes field
                yield user.updateOne({ $push: { likedNotes: note._id } }, { upsert: true });
                return res.status(200).json({ likedBy: req.user, likedNote: note });
            }
            res.status(500).json({ err_message: "No such note." });
        }
        else {
            throw new AppError_1.default("Page not found", 404);
        }
    }
    catch (err) {
        throw new AppError_1.default("Page not found.", 404);
    }
});
exports.handleLike = handleLike;
