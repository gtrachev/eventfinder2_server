"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const asyncWrap_1 = __importDefault(require("../utils/asyncWrap"));
const joiSchemas_1 = require("../utils/joi/joiSchemas");
const isLoggedIn_1 = __importDefault(require("../utils/middleware/isLoggedIn"));
const joiValidators_1 = require("../utils/middleware/joiValidators");
const reviewController = __importStar(require("../controllers/reviewController"));
const isReviewAuthor_1 = __importDefault(require("../utils/middleware/isReviewAuthor"));
const isEventExpired_1 = require("../utils/middleware/isEventExpired");
const reviewsRouter = express_1.default.Router();
//POST - /api/reviews/create/:event_id
//create review
reviewsRouter.post("/create/:event_id", isLoggedIn_1.default, isEventExpired_1.isEventExpired, (req, res, next) => (0, joiValidators_1.validateBodyData)(joiSchemas_1.reviewJoiSchema, req, res, next), (0, asyncWrap_1.default)(reviewController.createReview));
//DELETE - /api/reviews/delete/:review_id
//delete review
reviewsRouter.delete("/delete/:review_id", isLoggedIn_1.default, isReviewAuthor_1.default, (0, asyncWrap_1.default)(reviewController.deleteReview));
exports.default = reviewsRouter;
