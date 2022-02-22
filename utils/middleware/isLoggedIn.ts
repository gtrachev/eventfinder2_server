import { NextFunction, Request, Response } from "express";
import AppError from "../AppError";

const isLoggedIn = (req: Request, res: Response, next: NextFunction) => {
  //check if user is logged in through passport built-in function
  if (req.isAuthenticated()) {
    return next();
  } else {
    throw new AppError("You must be logged in to access this page.", 401);
  }
};

export default isLoggedIn;
