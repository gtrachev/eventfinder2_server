"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const asyncWrap_1 = __importDefault(require("../utils/asyncWrap"));
const isLoggedIn_1 = __importDefault(require("../utils/middleware/isLoggedIn"));
const chatController = __importStar(require("../controllers/chatController"));
const isEventExpired_1 = require("../utils/middleware/isEventExpired");
const chatsRouter = express_1.default.Router();
//GET - /api/chats/messages/:chat_id
//Get chat messages
chatsRouter.get("/messages/:chat_id", isLoggedIn_1.default, (0, asyncWrap_1.default)(chatController.getChatMessages));
//POST - /api/chats/message/:chat_id
//Create message
//ischatmember
chatsRouter.post("/message/:chat_id", isLoggedIn_1.default, (0, asyncWrap_1.default)(chatController.creatMessage));
//GET - /api/chats/:chat_id
//Get chat
chatsRouter.get("/:chat_id", isLoggedIn_1.default, (0, asyncWrap_1.default)(chatController.getChat));
//GET - /api/chats/join/:event_id
//Handle join event chat
chatsRouter.get("/join/:event_id", isLoggedIn_1.default, isEventExpired_1.isEventExpired, (0, asyncWrap_1.default)(chatController.handleJoinEventChat));
//GET - /api/chats/create/:member_id
//Create chat between two users
chatsRouter.get("/create/:member_id", isLoggedIn_1.default, (0, asyncWrap_1.default)(chatController.createUserChat));
//DELETE - /api/chats/delete/:chat_id
//delete chat
// chatsRouter.delete(
//   "/delete/:chat_id",
//   isLoggedIn,
//   asyncWrap(chatController.deleteChat)
// );
exports.default = chatsRouter;
