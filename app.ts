if (process.env.NODE_ENV !== "production") {
}

require("dotenv").config();
import express, { Application, Request, Response, NextFunction } from "express";
const app: Application = express();
const https = require("https");
const httpServer = require("http").createServer(app);
const fs = require("fs");
// const privateKey = fs.readFileSync("sslcert/key.pem", "utf8");
// const certificate = fs.readFileSync("sslcert/cert.pem", "utf8");
// const credentials = { key: privateKey, cert: certificate };
// const httpsServer = https.createServer(credentials, app);

const io = require("socket.io")(httpServer, {
  cors: {
    origin: "http://localhost:3001",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
import { Socket } from "socket.io";
import mongoose, { HydratedDocument, ObjectId } from "mongoose";
import cors from "cors";
import session from "express-session";
import ExpressMongoSanitize from "express-mongo-sanitize";
import helmet from "helmet";
import AppError from "./utils/AppError";
import sessionConfig from "./utils/SessionConfig";
import passport from "passport";
const LocalStrategy = require("passport-local");
import User from "./models/User";
import usersRouter from "./routers/userRouter";
import reviewsRouter from "./routers/reviewRouter";
import postsRouter from "./routers/postRouter";
import notesRouter from "./routers/noteRouter";
import eventsRouter from "./routers/eventRouter";
import chatsRouter from "./routers/chatRouter";
import Message from "./models/Message";
import Chat from "./models/Chat";
import { ChatType, MessageType } from "./utils/types/modelTypes";

//connect to database
const dbURL = process.env.DB_URL || "mongodb://localhost:27017/eventfinder2";
mongoose.connect(dbURL);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error: "));
db.once("open", () => {
  console.log("Database connected.");
});

//configure cors
app.set("trust proxy", 1);
app.use(cors({ credentials: true, origin: "http://localhost:3001" }));

//configure req.body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//session
app.use(session(sessionConfig));

//security
//sanitize mongo
app.use(
  ExpressMongoSanitize({
    replaceWith: "_",
  })
);
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

//setup passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//SOCKET.IO
let onlineUsers: { userId: any; socketId: string }[] = [];

//add to online users
const addUser = (userId: string, socketId: string) => {
  !onlineUsers.find((onlineUser) => onlineUser.userId === userId) &&
    onlineUsers.push({ userId, socketId });
};
//remove from online users
const removeUser = (socketId: string) => {
  onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};

//handle when user connects to socket
io.on("connection", (socket: Socket) => {
  console.log("user connected");

  //join user to room
  socket.on(
    "joinRoom",
    async ({ userId, chatId }: { userId: string; chatId: string }) => {
      addUser(userId, socket.id);
      const chat: HydratedDocument<ChatType> | null = await Chat.findById(
        chatId
      );
      if (chat) {
        if (chat.type === "group") {
          socket.join(`${chat._id}`);
        } else {
          socket.join(`${chat.members[0]} & ${chat.members[1]}`);
        }
      }
      io.emit("getOnlineUsers", onlineUsers);
    }
  );

  //handle when a message is emitted
  socket.on(
    "sendMessage",
    async ({
      message,
      chatId,
      senderId,
    }: {
      message: any;
      chatId: ObjectId;
      senderId: ObjectId;
    }) => {
      const chat: HydratedDocument<ChatType> | null = await Chat.findById(
        chatId
      );
      if (chat) {
        const newMessage: HydratedDocument<MessageType> = new Message({
          text: message,
        });
        newMessage.author = senderId;
        newMessage.chat = chatId;
        await newMessage.save();
        await chat.updateOne(
          { $push: { messages: newMessage._id } },
          { upsert: true }
        );
        const populatedMessage: HydratedDocument<MessageType> | null =
          await Message.findById(newMessage._id).populate("author");
        if (chat.type === "group") {
          io.to(`${chat._id}`).emit("getMessage", populatedMessage);
        } else {
          io.to(`${chat.members[0]} & ${chat.members[1]}`).emit(
            "getMessage",
            populatedMessage
          );
        }
      }
    }
  );

  //handle when user disconnects
  socket.on("disconnect", () => {
    removeUser(socket.id);
    io.emit("getOnlineUsers", onlineUsers);
  });
});
//SOCKET.IO

//routers
app.use("/api/user", usersRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/posts", postsRouter);
app.use("/api/notes", notesRouter);
app.use("/api/events", eventsRouter);
app.use("/api/chats", chatsRouter);

//handle 404 error
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  next(new AppError("Page not found.", 404));
});

//handle errors
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  res.status(err.status || 500).json({ err_message: err.message });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`LISTENING ON PORT: ${PORT} `);
});
