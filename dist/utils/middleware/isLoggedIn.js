"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../AppError"));
const isLoggedIn = (req, res, next) => {
    //check if user is logged in through passport built-in function
    if (req.isAuthenticated()) {
        return next();
    }
    else {
        throw new AppError_1.default("You must be logged in to access this page.", 401);
    }
};
exports.default = isLoggedIn;
