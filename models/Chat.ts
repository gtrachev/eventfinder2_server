import mongoose from "mongoose";
const Schema = mongoose.Schema;
import { ChatType } from "../src/utils/types/modelTypes";

const ChatSchema = new Schema<ChatType>(
  {
    type: {
      type: String,
      required: true,
    },
    members: {
      type: [Schema.Types.ObjectId],
      ref: "User",
    },
    messages: {
      type: [Schema.Types.ObjectId],
      ref: "Message",
    },
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
    },
  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", ChatSchema);
export default Chat;
