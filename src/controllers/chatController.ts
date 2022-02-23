import { Request, Response } from "express";
import mongoose, { HydratedDocument, ObjectId } from "mongoose";
import Chat from "../../models/Chat";
import Event from "../../models/Event";
import Message from "../../models/Message";
import User from "../../models/User";
import AppError from "../utils/AppError";
import {
  ChatType,
  EventType,
  MessageType,
  UserRequest,
  UserType,
} from "../utils/types/modelTypes";

//GET - /api/chats/messages/:chat_id
//Get chat messages
export const getChatMessages = async (req: Request, res: Response) => {
  try {
    const { chat_id } = req.params;
    //validate object_id
    if (mongoose.isValidObjectId(chat_id)) {
      const chat: HydratedDocument<ChatType> | null = await Chat.findById(
        chat_id
      ).populate("messages");
      if (chat) {
        return res.status(200).json({ chatMessages: chat.messages });
      }
      res.status(500).json({ err_message: "No such chat." });
    } else {
      throw new AppError("Page not found", 404);
    }
  } catch (err) {
    throw new AppError("Page not found", 404);
  }
};

//POST - /api/chats/message/:chat_id
//Create message
export const creatMessage = async (req: UserRequest, res: Response) => {
  try {
    const { chat_id } = req.params;
    if (mongoose.isValidObjectId(chat_id)) {
      const chat: HydratedDocument<ChatType> | null = await Chat.findById(
        chat_id
      );
      if (chat) {
        //check if user is a member of chat room
        if (
          req.user.inChats.find((inChatId: ObjectId) => inChatId === chat._id)
        ) {
          //create new message
          const newMessage: HydratedDocument<MessageType> = new Message(
            req.body
          );
          //assign author and chat to message
          newMessage.author = req.user._id;
          newMessage.chat = chat._id;
          await newMessage.save();
          //push the current chat's messages with the new message
          await chat.updateOne(
            { $push: { messages: newMessage._id } },
            { upsert: true }
          );
          return res.status(200).json({ newMessage });
        }
        res.status(500).json({ err_message: "Not member of chat room." });
      }
      res.status(500).json({ err_message: "No such chat." });
    } else {
      throw new AppError("Page not found", 404);
    }
  } catch (err) {
    throw new AppError("Page not found", 404);
  }
};

//GET - /api/chats/:chat_id
//Get chat
export const getChat = async (req: Request, res: Response) => {
  try {
    const { chat_id } = req.params;
    //validate object_id
    if (mongoose.isValidObjectId(chat_id)) {
      const chat: HydratedDocument<ChatType> | null = await Chat.findById(
        chat_id
      )
        .populate("members")
        .populate({ path: "messages", populate: { path: "author" } })
        .populate({ path: "event", populate: { path: "author" } });
      if (chat) {
        return res.status(200).json({ chat });
      }
      res.status(404).json({ err_message: "No such chat." });
    } else {
      throw new AppError("Page not found", 404);
    }
  } catch {
    throw new AppError("Page not found", 404);
  }
};

//GET - /api/chats/join/:event_id
//Handle join event chat
export const handleJoinEventChat = async (req: UserRequest, res: Response) => {
  try {
    const { event_id } = req.params;
    if (mongoose.isValidObjectId(event_id)) {
      const event: HydratedDocument<EventType> | null = await Event.findById(
        event_id
      )
        .populate("author")
        .populate("reviews")
        .populate("attenders")
        .populate("chat");
      if (event) {
        const currentUser = await User.findById(req.user._id);
        const eventChat: HydratedDocument<ChatType> | null =
          await Chat.findById(event.chat._id)
            .populate("members")
            .populate("messages")
            .populate("event");
        //check if user has joined chat, if yes remove from chat room else add to chat room
        if (eventChat) {
          if (
            currentUser.inChats.find((chat: ObjectId) => eventChat._id === chat)
          ) {
            //pull chat from users inCHats fields
            await currentUser.updateOne(
              { $pull: { inChats: eventChat._id } },
              { upsert: true }
            );
            //pull user from current chat's members
            await eventChat.updateOne(
              { $pull: { members: currentUser._id } },
              { upsert: true }
            );
            return res.status(200).json({
              removedMember: currentUser,
              leftChat: eventChat,
            });
          } else {
            //push chat to current user's inChats field
            await currentUser.updateOne(
              { $push: { inChats: eventChat._id } },
              { upsert: true }
            );
            //push user to current chat's members field
            await eventChat.updateOne(
              { $push: { members: currentUser._id } },
              { upsert: true }
            );
            return res.status(200).json({
              addedMember: currentUser,
              joinedChat: eventChat,
            });
          }
        } else {
          return res.status(404).json({ err_message: "Event not found" });
        }
      }
      res.status(404).json({ err_message: "Event not found" });
    } else {
      res.status(404).json({ err_message: "Page not found" });
    }
  } catch (err) {
    throw new AppError("Page not found", 404);
  }
};

//POST - /api/chats/create/:member_id
//Create chat between two users
export const createUserChat = async (req: UserRequest, res: Response) => {
  try {
    const { member_id } = req.params;
    //validate object_id
    if (mongoose.isValidObjectId(member_id)) {
      const member: HydratedDocument<UserType> | null = await User.findById(
        member_id
      );
      if (member) {
        const currentUser = await User.findById(req.user._id);
        //check if there already is a chat between the two users, if yes, respond with error,
        //else create new chat
        if (
          await Chat.findOne(
            {
              members: [member_id, currentUser._id] || [
                currentUser._id,
                member_id,
              ],
            },
            { type: "personal" }
          )
        ) {
          return res.status(500).json({ err_message: "Chat already exists." });
        }
        //create new chat
        const newUserChat: HydratedDocument<ChatType> = new Chat({
          members: [currentUser._id, member_id],
          type: "personal",
        });
        await newUserChat.save();
        //push the currents user inChats field with the new chat
        await currentUser.updateOne(
          { $push: { inChats: newUserChat._id } },
          { upsert: true }
        );
        //push the other members inChats field with the new chat
        await member.updateOne(
          { $push: { inChats: newUserChat._id } },
          { upsert: true }
        );
        return res.status(200).json({ newUserChat });
      }
      res.status(404).json({ err_message: "No such user." });
    } else {
      throw new AppError("Page not found", 404);
    }
  } catch (err) {
    throw new AppError("Page not found", 404);
  }
};

//DELETE - /api/chats/delete/:chat_id
//delete chat
// export const deleteChat = async (req: Request, res: Response) => {
//   try {
//     const { chat_id } = req.params;
//     const deletedChat: HydratedDocument<ChatType> | null =
//       await Chat.findByIdAndDelete(chat_id);
//     if (deletedChat) {
//       res.status(200).json({ deletedChat });
//     }
//     res.status(200).json({ message: "No such chat." });
//   } catch {
//     throw new AppError("Page not found", 404);
//   }
// };
