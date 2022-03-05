import mongoose from "mongoose";
const Schema = mongoose.Schema;
import { MessageType } from "../utils/types/modelTypes";

const msgSchema = new Schema<MessageType>(
  {
    chat: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
    },
    text: {
      type: String,
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", msgSchema);
export default Message;
