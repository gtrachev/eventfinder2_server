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
exports.isEventExpired = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Event_1 = __importDefault(require("../../models/Event"));
const AppError_1 = __importDefault(require("../AppError"));
const isEventExpired = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { event_id = "" } = req.params;
        //validate object_id
        if (mongoose_1.default.isValidObjectId(event_id)) {
            const event = yield Event_1.default.findById(event_id);
            if (event) {
                //check if the date of the event has passed the current date, if not return next and continue
                if (new Date(event.date) < new Date(Date.now())) {
                    res.status(405).json({ err_message: "Event has expired." });
                }
                return next();
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
exports.isEventExpired = isEventExpired;
