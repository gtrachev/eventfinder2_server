import { SessionOptions } from "express-session";
const MongoStore = require("connect-mongo");

const dbURL = process.env.DB_URL || "mongodb://localhost:27017/eventfinder2";
const secret = process.env.SECRET || "backupsecret";
//create mongo store
const sessionStore = MongoStore.create({
  mongoUrl: dbURL,
  touchAfter: 24 * 60 * 60,
  crypto: {
    secret: secret,
  },
});

//handle session store errors
sessionStore.on("error", (e: Error) => {
  console.log("SESSION STORE ERROR!", e);
});

//configure session options
const sessionConfig: SessionOptions = {
  store: sessionStore,
  name: "eventfinder2-session",
  secret: secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: true,
    sameSite: "none",
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

export default sessionConfig;
