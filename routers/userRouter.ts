import express, { Request, Response, NextFunction } from "express";
import passport from "passport";
import asyncWrap from "../utils/asyncWrap";
import isLoggedIn from "../utils/middleware/isLoggedIn";
import * as userController from "../controllers/userController";
import { validateBodyData } from "../utils/middleware/joiValidators";
import {
  editUserJoiSchema,
  userLoginJoiSchema,
} from "../utils/joi/joiSchemas";
const userRouters = express.Router();

//GET - /api/user/current
//return current user
userRouters.get("/current", asyncWrap(userController.getUser));

//GET - /api/user/by_id/:user_id
//return user by id
userRouters.get("/by_id/:user_id", asyncWrap(userController.getUserById));

//GET - /api/user/recommended
//return recommended users
userRouters.get("/recommended", asyncWrap(userController.getRecommendedUsers));

//POST - /api/user/login
//login user
userRouters.post(
  "/login",
  passport.authenticate("local"),
  userController.loginUser
);

//POST - /api/user/register
//register user
userRouters.post("/register", asyncWrap(userController.registerUser));

//PUT - /api/user/edit
//edit user account
userRouters.put(
  "/edit",
  (req: Request, res: Response, next: NextFunction) =>
    validateBodyData(editUserJoiSchema, req, res, next),
  asyncWrap(userController.editUser)
);

//GET - /api/user/logout
//logout user
userRouters.get("/logout", isLoggedIn, userController.logoutUser);

//GET - /api/user/checkUser/:user
//check if user data is valid
userRouters.post(
  "/checkUser",
  (req: Request, res: Response, next: NextFunction) =>
    validateBodyData(userLoginJoiSchema, req, res, next),
  asyncWrap(userController.checkUser)
);

//GET - /api/user/checkUsername/:username
//check if username is available
userRouters.get(
  "/checkUsername/:username",
  asyncWrap(userController.checkUsername)
);

//GET - /api/user/follow/:account_id
//handle the following of other users
userRouters.get(
  "/follow/:account_id",
  isLoggedIn,
  asyncWrap(userController.handleFollow)
);

export default userRouters;
