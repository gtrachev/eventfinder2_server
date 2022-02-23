"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const asyncWrap_1 = __importDefault(require("../utils/asyncWrap"));
const joiSchemas_1 = require("../utils/joi/joiSchemas");
const isLoggedIn_1 = __importDefault(require("../utils/middleware/isLoggedIn"));
const joiValidators_1 = require("../utils/middleware/joiValidators");
const notesController = __importStar(require("../controllers/noteController"));
const isNoteAuthor_1 = __importDefault(require("../utils/middleware/isNoteAuthor"));
const notesRouter = express_1.default.Router();
//POST - /api/notes/create
//create note
notesRouter.post("/create", isLoggedIn_1.default, (req, res, next) => (0, joiValidators_1.validateBodyData)(joiSchemas_1.noteJoiSchema, req, res, next), (0, asyncWrap_1.default)(notesController.createNote));
//DELETE - /api/notes/delete/:note_id
//delete note
notesRouter.delete("/delete/:note_id", isLoggedIn_1.default, isNoteAuthor_1.default, (0, asyncWrap_1.default)(notesController.deleteNote));
//GET - /api/notes/like/:note_id
//like note
notesRouter.get("/like/:note_id", isLoggedIn_1.default, (0, asyncWrap_1.default)(notesController.handleLike));
exports.default = notesRouter;
