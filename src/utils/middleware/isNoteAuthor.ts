import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import Note from "../../models/Note";
import AppError from "../AppError";
import { UserRequest } from "../types/modelTypes";

const isNoteAuthor = async (
  req: UserRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { note_id = "" } = req.params;
    //validate object_id
    if (mongoose.isValidObjectId(note_id)) {
      const note: any = await Note.findById(note_id);
      if (note) {
        //chek if user is note author
        if (note.author.equals(req.user._id)) {
          return next();
        }
        return res.status(401).json({ message: "Not owner of the note." });
      }
      res.status(401).json({ message: "No note found." });
    } else {
      throw new AppError("Page not found", 404);
    }
  } catch {
    throw new AppError("Page not found", 404);
  }
};

export default isNoteAuthor;
