import mongoose from "mongoose";
import { NoteType } from "../src/utils/types/modelTypes";
const Schema = mongoose.Schema;

export const noteSchema = new Schema<NoteType>({
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

const Note = mongoose.model("Note", noteSchema);
export default Note;
