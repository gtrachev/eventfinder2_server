"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBodyData = void 0;
const AppError_1 = __importDefault(require("../AppError"));
const validateBodyData = (schema, req, res, next) => {
    const data = req.body;
    //validate request body with given schema
    const { error } = schema.validate(data);
    if (!error) {
        return next();
    }
    const err_message = error.details.map((el) => el.message).join(", ");
    throw new AppError_1.default(err_message, 400);
};
exports.validateBodyData = validateBodyData;
