import { Response } from "express";
import mongoose, { HydratedDocument } from "mongoose";
import Note from "../models/Note";
import User from "../models/User";
import AppError from "../utils/AppError";
import { NoteType, UserRequest } from "../utils/types/modelTypes";

//POST - /api/notes/create
//create note
export const createNote = async (req: UserRequest, res: Response) => {
  const { body, shared_event } = req.body;
  //check if note includes a shared event
  const noteData = shared_event.length
    ? {
        body,
        shared_event,
      }
    : { body };
  //create note
  const note: HydratedDocument<NoteType> = new Note(noteData);
  //assign note author
  note.author = req.user._id;
  await note.save();

  res.status(200).json({ note });
};

//DELETE - api/notes/delete/note_id
//delete note
export const deleteNote = async (req: UserRequest, res: Response) => {
  try {
    const { note_id } = req.params;
    //validate object_id
    if (mongoose.isValidObjectId(note_id)) {
      //delete note
      const deletedNote: HydratedDocument<NoteType> | null =
        await Note.findByIdAndDelete(note_id);
      if (deletedNote) {
        return res.status(200).json({ deletedNote });
      }
      res.status(200).json({ message: "No such note." });
    } else {
      throw new AppError("Page not found", 404);
    }
  } catch {
    throw new AppError("Page not found.", 404);
  }
};

//GET - api/notes/like/note_id
//handle like
export const handleLike = async (req: UserRequest, res: Response) => {
  try {
    const { note_id } = req.params;
    if (mongoose.isValidObjectId(note_id)) {
      const note = await Note.findById(note_id).populate("likedBy");
      if (note) {
        const user = await User.findById(req.user._id);
        //check if user has liked the note, if yes, unlike, else like
        if (
          note.likedBy.find((userLiked: any) => userLiked._id.equals(user._id))
        ) {
          //pull current user from note likedBy field
          await note.updateOne(
            { $pull: { likedBy: req.user._id } },
            { upsert: true }
          );
          //pull unliked note form user's likedNotes field
          await user.updateOne(
            { $pull: { likedNotes: note._id } },
            { upsert: true }
          );
          return res
            .status(200)
            .json({ unlikedBy: req.user, unlikedNote: note });
        }
        //push current user to note likedBy field
        await note.updateOne(
          { $push: { likedBy: req.user._id } },
          { upsert: true }
        );
        //push liked note to user's likedNotes field
        await user.updateOne(
          { $push: { likedNotes: note._id } },
          { upsert: true }
        );
        return res.status(200).json({ likedBy: req.user, likedNote: note });
      }
      res.status(500).json({ err_message: "No such note." });
    } else {
      throw new AppError("Page not found", 404);
    }
  } catch (err) {
    throw new AppError("Page not found.", 404);
  }
};
