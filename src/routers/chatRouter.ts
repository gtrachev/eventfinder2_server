import express from "express";
import asyncWrap from "../utils/asyncWrap";
import isLoggedIn from "../utils/middleware/isLoggedIn";
import * as chatController from "../controllers/chatController";
import { isEventExpired } from "../utils/middleware/isEventExpired";
const chatsRouter = express.Router();

//GET - /api/chats/messages/:chat_id
//Get chat messages
chatsRouter.get(
  "/messages/:chat_id",
  isLoggedIn,
  asyncWrap(chatController.getChatMessages)
);

//POST - /api/chats/message/:chat_id
//Create message
//ischatmember
chatsRouter.post(
  "/message/:chat_id",
  isLoggedIn,
  asyncWrap(chatController.creatMessage)
);

//GET - /api/chats/:chat_id
//Get chat
chatsRouter.get("/:chat_id", isLoggedIn, asyncWrap(chatController.getChat));

//GET - /api/chats/join/:event_id
//Handle join event chat
chatsRouter.get(
  "/join/:event_id",
  isLoggedIn,
  isEventExpired,
  asyncWrap(chatController.handleJoinEventChat)
);

//GET - /api/chats/create/:member_id
//Create chat between two users
chatsRouter.get(
  "/create/:member_id",
  isLoggedIn,
  asyncWrap(chatController.createUserChat)
);

//DELETE - /api/chats/delete/:chat_id
//delete chat
// chatsRouter.delete(
//   "/delete/:chat_id",
//   isLoggedIn,
//   asyncWrap(chatController.deleteChat)
// );

export default chatsRouter;
