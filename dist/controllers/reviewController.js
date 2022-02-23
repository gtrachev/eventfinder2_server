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
exports.deleteReview = exports.createReview = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Event_1 = __importDefault(require("../models/Event"));
const Review_1 = __importDefault(require("../models/Review"));
const AppError_1 = __importDefault(require("../utils/AppError"));
//POST - /api/reviews/create/:event_id
//create review
const createReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { event_id } = req.params;
        //validate object_id
        if (mongoose_1.default.isValidObjectId(event_id)) {
            const event = yield Event_1.default.findById(event_id);
            if (event) {
                const reviewData = req.body;
                //create review
                const newReview = new Review_1.default(reviewData);
                //assign review author
                newReview.author = req.user._id;
                yield newReview.save();
                yield event.updateOne({ $push: { reviews: newReview._id } });
                return res.status(200).json({ newReview });
            }
            res.status(500).json({ message: "No such event." });
        }
        else {
            throw new AppError_1.default("Page not found", 404);
        }
    }
    catch (err) {
        throw new AppError_1.default("Page not found", 404);
    }
});
exports.createReview = createReview;
//DELETE - /api/reviews/delete/:review_id
//delete review
const deleteReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { review_id } = req.params;
        //validate object_id
        if (mongoose_1.default.isValidObjectId(review_id)) {
            //delete review
            const deletedReview = yield Review_1.default.findByIdAndDelete(review_id);
            if (deletedReview) {
                return res.status(200).json({ deletedReview });
            }
            res.status(500).json({ message: "No such review." });
        }
        else {
            throw new AppError_1.default("Page not found", 404);
        }
    }
    catch (err) {
        throw new AppError_1.default("Page not found", 404);
    }
});
exports.deleteReview = deleteReview;
