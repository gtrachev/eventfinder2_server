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
exports.getFollowingPosts = void 0;
const Event_1 = __importDefault(require("../models/Event"));
const Note_1 = __importDefault(require("../models/Note"));
const compareDates_1 = require("../utils/compareDates");
const AppError_1 = __importDefault(require("../utils/AppError"));
//GET - /api/posts/following/:fromDays
//Get following posts
const getFollowingPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const followingUsers = req.user.following;
        const fromDays = parseInt(req.params.fromDays);
        //get events from accounts, followed by user
        const followingEvents = yield Promise.all(followingUsers.map((followingUser) => __awaiter(void 0, void 0, void 0, function* () {
            const followingUsersEvents = yield Event_1.default.find()
                .and([
                { author: followingUser },
                { date: { $gte: new Date(Date.now()) } },
            ])
                .populate("author")
                .populate("attenders");
            return followingUsersEvents ? followingUsersEvents : [];
        })));
        //filter the events, only to those posted in the last fromDays
        const filteredFollowingEvents = followingEvents.length
            ? followingEvents[0].filter((event) => {
                return (0, compareDates_1.differenceOfDates)(event.created_at) <= fromDays;
            })
            : [];
        //get notes from accounts, followed by user
        const followingNotes = yield Promise.all(followingUsers.map((followingUser) => __awaiter(void 0, void 0, void 0, function* () {
            const followingUsersNotes = yield Note_1.default.find({
                author: followingUser,
            })
                .populate("author")
                .populate({
                path: "shared_event",
                populate: {
                    path: "author",
                },
            })
                .populate("likedBy");
            return followingUsersNotes ? followingUsersNotes : [];
        })));
        //filter those notes, only to those posted in the last fromDays
        const filteredFollowingNotes = followingNotes.length
            ? followingNotes[0].filter((note) => {
                return (0, compareDates_1.differenceOfDates)(note.created_at) <= fromDays;
            })
            : [];
        //combine notes and events and sort them from newer to older
        const followingPosts = [
            ...filteredFollowingEvents,
            ...filteredFollowingNotes,
        ].sort((a, b) => {
            return b.created_at - a.created_at;
        });
        if (followingPosts.length) {
            return res.status(200).json({ followingPosts });
        }
        res.status(200).json({ message: "No new posts." });
    }
    catch (err) {
        throw new AppError_1.default("There was an issue.", 500);
    }
});
exports.getFollowingPosts = getFollowingPosts;
