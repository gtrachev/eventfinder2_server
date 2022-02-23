import mongoose from "mongoose";
import { MessageType } from "../src/utils/types/modelTypes";
const Schema = mongoose.Schema;

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
