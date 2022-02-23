"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserChat = exports.handleJoinEventChat = exports.getChat = exports.creatMessage = exports.getChatMessages = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Chat_1 = __importDefault(require("../models/Chat"));
const Event_1 = __importDefault(require("../models/Event"));
const Message_1 = __importDefault(require("../models/Message"));
const User_1 = __importDefault(require("../models/User"));
const AppError_1 = __importDefault(require("../utils/AppError"));
//GET - /api/chats/messages/:chat_id
//Get chat messages
const getChatMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chat_id } = req.params;
        //validate object_id
        if (mongoose_1.default.isValidObjectId(chat_id)) {
            const chat = yield Chat_1.default.findById(chat_id).populate("messages");
            if (chat) {
                return res.status(200).json({ chatMessages: chat.messages });
            }
            res.status(500).json({ err_message: "No such chat." });
        }
        else {
            throw new AppError_1.default("Page not found", 404);
        }
    }
    catch (err) {
        throw new AppError_1.default("Page not found", 404);
    }
});
exports.getChatMessages = getChatMessages;
//POST - /api/chats/message/:chat_id
//Create message
const creatMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chat_id } = req.params;
        if (mongoose_1.default.isValidObjectId(chat_id)) {
            const chat = yield Chat_1.default.findById(chat_id);
            if (chat) {
                //check if user is a member of chat room
                if (req.user.inChats.find((inChatId) => inChatId === chat._id)) {
                    //create new message
                    const newMessage = new Message_1.default(req.body);
                    //assign author and chat to message
                    newMessage.author = req.user._id;
                    newMessage.chat = chat._id;
                    yield newMessage.save();
                    //push the current chat's messages with the new message
                    yield chat.updateOne({ $push: { messages: newMessage._id } }, { upsert: true });
                    return res.status(200).json({ newMessage });
                }
                res.status(500).json({ err_message: "Not member of chat room." });
            }
            res.status(500).json({ err_message: "No such chat." });
        }
        else {
            throw new AppError_1.default("Page not found", 404);
        }
    }
    catch (err) {
        throw new AppError_1.default("Page not found", 404);
    }
});
exports.creatMessage = creatMessage;
//GET - /api/chats/:chat_id
//Get chat
const getChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chat_id } = req.params;
        //validate object_id
        if (mongoose_1.default.isValidObjectId(chat_id)) {
            const chat = yield Chat_1.default.findById(chat_id)
                .populate("members")
                .populate({ path: "messages", populate: { path: "author" } })
                .populate({ path: "event", populate: { path: "author" } });
            if (chat) {
                return res.status(200).json({ chat });
            }
            res.status(404).json({ err_message: "No such chat." });
        }
        else {
            throw new AppError_1.default("Page not found", 404);
        }
    }
    catch (_a) {
        throw new AppError_1.default("Page not found", 404);
    }
});
exports.getChat = getChat;
//GET - /api/chats/join/:event_id
//Handle join event chat
const handleJoinEventChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { event_id } = req.params;
        if (mongoose_1.default.isValidObjectId(event_id)) {
            const event = yield Event_1.default.findById(event_id)
                .populate("author")
                .populate("reviews")
                .populate("attenders")
                .populate("chat");
            if (event) {
                const currentUser = yield User_1.default.findById(req.user._id);
                const eventChat = yield Chat_1.default.findById(event.chat._id)
                    .populate("members")
                    .populate("messages")
                    .populate("event");
                //check if user has joined chat, if yes remove from chat room else add to chat room
                if (eventChat) {
                    if (currentUser.inChats.find((chat) => eventChat._id === chat)) {
                        //pull chat from users inCHats fields
                        yield currentUser.updateOne({ $pull: { inChats: eventChat._id } }, { upsert: true });
                        //pull user from current chat's members
                        yield eventChat.updateOne({ $pull: { members: currentUser._id } }, { upsert: true });
                        return res.status(200).json({
                            removedMember: currentUser,
                            leftChat: eventChat,
                        });
                    }
                    else {
                        //push chat to current user's inChats field
                        yield currentUser.updateOne({ $push: { inChats: eventChat._id } }, { upsert: true });
                        //push user to current chat's members field
                        yield eventChat.updateOne({ $push: { members: currentUser._id } }, { upsert: true });
                        return res.status(200).json({
                            addedMember: currentUser,
                            joinedChat: eventChat,
                        });
                    }
                }
                else {
                    return res.status(404).json({ err_message: "Event not found" });
                }
            }
            res.status(404).json({ err_message: "Event not found" });
        }
        else {
            res.status(404).json({ err_message: "Page not found" });
        }
    }
    catch (err) {
        throw new AppError_1.default("Page not found", 404);
    }
});
exports.handleJoinEventChat = handleJoinEventChat;
//POST - /api/chats/create/:member_id
//Create chat between two users
const createUserChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { member_id } = req.params;
        //validate object_id
        if (mongoose_1.default.isValidObjectId(member_id)) {
            const member = yield User_1.default.findById(member_id);
            if (member) {
                const currentUser = yield User_1.default.findById(req.user._id);
                //check if there already is a chat between the two users, if yes, respond with error,
                //else create new chat
                if (yield Chat_1.default.findOne({
                    members: [member_id, currentUser._id] || [
                        currentUser._id,
                        member_id,
                    ],
                }, { type: "personal" })) {
                    return res.status(500).json({ err_message: "Chat already exists." });
                }
                //create new chat
                const newUserChat = new Chat_1.default({
                    members: [currentUser._id, member_id],
                    type: "personal",
                });
                yield newUserChat.save();
                //push the currents user inChats field with the new chat
                yield currentUser.updateOne({ $push: { inChats: newUserChat._id } }, { upsert: true });
                //push the other members inChats field with the new chat
                yield member.updateOne({ $push: { inChats: newUserChat._id } }, { upsert: true });
                return res.status(200).json({ newUserChat });
            }
            res.status(404).json({ err_message: "No such user." });
        }
        else {
            throw new AppError_1.default("Page not found", 404);
        }
    }
    catch (err) {
        throw new AppError_1.default("Page not found", 404);
    }
});
exports.createUserChat = createUserChat;
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
