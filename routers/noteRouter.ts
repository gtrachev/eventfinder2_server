import express, { Request, Response, NextFunction } from "express";
import asyncWrap from "../utils/asyncWrap";
import { noteJoiSchema } from "../utils/joi/joiSchemas";
import isLoggedIn from "../utils/middleware/isLoggedIn";
import { validateBodyData } from "../utils/middleware/joiValidators";
import * as notesController from "../controllers/noteController";
import isNoteAuthor from "../utils/middleware/isNoteAuthor";
const notesRouter = express.Router();

//POST - /api/notes/create
//create note
notesRouter.post(
  "/create",
  isLoggedIn,
  (req: Request, res: Response, next: NextFunction) =>
    validateBodyData(noteJoiSchema, req, res, next),
  asyncWrap(notesController.createNote)
);

//DELETE - /api/notes/delete/:note_id
//delete note
notesRouter.delete(
  "/delete/:note_id",
  isLoggedIn,
  isNoteAuthor,
  asyncWrap(notesController.deleteNote)
);

//GET - /api/notes/like/:note_id
//like note
notesRouter.get(
  "/like/:note_id",
  isLoggedIn,
  asyncWrap(notesController.handleLike)
);

export default notesRouter;
