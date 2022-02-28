import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import AppError from "../AppError";

export const validateBodyData = (
  schema: Joi.ObjectSchema<any>,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const data = req.body;
  //validate request body with given schema
  const { error } = schema.validate(data);
  if (!error) {
    return next();
  }
  const err_message = error.details.map((el) => el.message).join(", ");
  res.status(400).json({ err_message });
};
