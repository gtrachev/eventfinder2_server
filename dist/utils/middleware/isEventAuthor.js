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
const mongoose_1 = __importDefault(require("mongoose"));
const Event_1 = __importDefault(require("../../models/Event"));
const AppError_1 = __importDefault(require("../AppError"));
const isEventAuthor = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { event_id } = req.params;
        //validate object_id
        if (mongoose_1.default.isValidObjectId(event_id)) {
            const event = yield Event_1.default.findById(event_id).populate("author");
            //check if user is event author, if yes return next and continue
            if (event) {
                if (event.author === req.user) {
                    return next();
                }
                return res.status(401).json({ err_message: "Not owner of the event." });
            }
            res.status(404).json({ err_message: "Event not found." });
        }
        else {
            throw new AppError_1.default("Page not found", 404);
        }
    }
    catch (_a) {
        throw new AppError_1.default("Page not found", 404);
    }
});
exports.default = isEventAuthor;
