import mongoose, { HydratedDocument } from "mongoose";
import { MessageType } from "../utils/types/modelTypes";
const Schema = mongoose.Schema;

const msgSchema = new Schema<HydratedDocument<MessageType>>(
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
