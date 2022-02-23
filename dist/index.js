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
if (process.env.NODE_ENV !== "production") {
}
require("dotenv").config();
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const https = require("https");
const httpServer = require("http").createServer(app);
const fs = require("fs");
// const privateKey = fs.readFileSync("sslcert/key.pem", "utf8");
// const certificate = fs.readFileSync("sslcert/cert.pem", "utf8");
// const credentials = { key: privateKey, cert: certificate };
// const httpsServer = https.createServer(credentials, app);
console.log(21);
const io = require("socket.io")(httpServer, {
    cors: {
        origin: "http://localhost:3001",
        methods: ["GET", "POST"],
        credentials: true,
    },
});
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const express_session_1 = __importDefault(require("express-session"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const helmet_1 = __importDefault(require("helmet"));
const AppError_1 = __importDefault(require("./utils/AppError"));
const SessionConfig_1 = __importDefault(require("./utils/SessionConfig"));
const passport_1 = __importDefault(require("passport"));
const LocalStrategy = require("passport-local");
const User_1 = __importDefault(require("./models/User"));
const userRouter_1 = __importDefault(require("./routers/userRouter"));
const reviewRouter_1 = __importDefault(require("./routers/reviewRouter"));
const postRouter_1 = __importDefault(require("./routers/postRouter"));
const noteRouter_1 = __importDefault(require("./routers/noteRouter"));
const eventRouter_1 = __importDefault(require("./routers/eventRouter"));
const chatRouter_1 = __importDefault(require("./routers/chatRouter"));
const Message_1 = __importDefault(require("./models/Message"));
const Chat_1 = __importDefault(require("./models/Chat"));
//connect to database
const dbURL = process.env.DB_URL || "mongodb://localhost:27017/eventfinder2";
mongoose_1.default.connect(dbURL);
const db = mongoose_1.default.connection;
db.on("error", console.error.bind(console, "Connection error: "));
db.once("open", () => {
    console.log("Database connected.");
});
//configure cors
app.set("trust proxy", 1);
app.use((0, cors_1.default)({ credentials: true, origin: "http://localhost:3001" }));
//configure req.body
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
//session
app.use((0, express_session_1.default)(SessionConfig_1.default));
//security
//sanitize mongo
app.use((0, express_mongo_sanitize_1.default)({
    replaceWith: "_",
}));
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false,
}));
//setup passport
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
passport_1.default.use(new LocalStrategy(User_1.default.authenticate()));
passport_1.default.serializeUser(User_1.default.serializeUser());
passport_1.default.deserializeUser(User_1.default.deserializeUser());
//SOCKET.IO
let onlineUsers = [];
//add to online users
const addUser = (userId, socketId) => {
    !onlineUsers.find((onlineUser) => onlineUser.userId === userId) &&
        onlineUsers.push({ userId, socketId });
};
//remove from online users
const removeUser = (socketId) => {
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};
//handle when user connects to socket
io.on("connection", (socket) => {
    console.log("user connected");
    //join user to room
    socket.on("joinRoom", ({ userId, chatId }) => __awaiter(void 0, void 0, void 0, function* () {
        addUser(userId, socket.id);
        const chat = yield Chat_1.default.findById(chatId);
        if (chat) {
            if (chat.type === "group") {
                socket.join(`${chat._id}`);
            }
            else {
                socket.join(`${chat.members[0]} & ${chat.members[1]}`);
            }
        }
        io.emit("getOnlineUsers", onlineUsers);
    }));
    //handle when a message is emitted
    socket.on("sendMessage", ({ message, chatId, senderId, }) => __awaiter(void 0, void 0, void 0, function* () {
        const chat = yield Chat_1.default.findById(chatId);
        if (chat) {
            const newMessage = new Message_1.default({
                text: message,
            });
            newMessage.author = senderId;
            newMessage.chat = chatId;
            yield newMessage.save();
            yield chat.updateOne({ $push: { messages: newMessage._id } }, { upsert: true });
            const populatedMessage = yield Message_1.default.findById(newMessage._id).populate("author");
            if (chat.type === "group") {
                io.to(`${chat._id}`).emit("getMessage", populatedMessage);
            }
            else {
                io.to(`${chat.members[0]} & ${chat.members[1]}`).emit("getMessage", populatedMessage);
            }
        }
    }));
    //handle when user disconnects
    socket.on("disconnect", () => {
        removeUser(socket.id);
        io.emit("getOnlineUsers", onlineUsers);
    });
});
//SOCKET.IO
//routers
app.use("/api/user", userRouter_1.default);
app.use("/api/reviews", reviewRouter_1.default);
app.use("/api/posts", postRouter_1.default);
app.use("/api/notes", noteRouter_1.default);
app.use("/api/events", eventRouter_1.default);
app.use("/api/chats", chatRouter_1.default);
//handle 404 error
app.all("*", (req, res, next) => {
    next(new AppError_1.default("Page not found.", 404));
});
//handle errors
app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ err_message: err.message });
});
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`LISTENING ON PORT: ${PORT} `);
});
