import express from "express";
import isLoggedIn from "../utils/middleware/isLoggedIn";
import * as postController from "../controllers/postController";
import asyncWrap from "../utils/asyncWrap";
const postsRouter = express.Router();

//GET - /api/posts/following/:fromDays
//Get following posts
postsRouter.get(
  "/following/:fromDays",
  isLoggedIn,
  asyncWrap(postController.getFollowingPosts)
);

export default postsRouter;
