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
exports.checkUsername = exports.checkUser = exports.handleFollow = exports.logoutUser = exports.editUser = exports.registerUser = exports.loginUser = exports.getRecommendedUsers = exports.getUserById = exports.getUser = void 0;
require("dotenv").config();
const User_1 = __importDefault(require("../models/User"));
const Event_1 = __importDefault(require("../models/Event"));
const AppError_1 = __importDefault(require("../utils/AppError"));
const Note_1 = __importDefault(require("../models/Note"));
const mongoose_1 = __importDefault(require("mongoose"));
const userTiers_1 = require("../utils/types/userTiers");
const stripe = require("stripe")(`sk_test_51KRiOiEKyWrvmmLo7mahBY5U904vqbnY5Hx7JNDZSGZTsR2EX1Q7XkQhXK0KieJUb5npuy25QaILg4PgRQy3Hccr00Ngs7z7ap`);
//GET - /api/user/current
//return current user
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.user) {
            const user = yield User_1.default.findById(req.user._id)
                .populate({
                path: "attending",
                populate: {
                    path: "author",
                },
            })
                .populate({
                path: "savedEvents",
                populate: {
                    path: "author",
                },
            })
                .populate("followers")
                .populate("following")
                .populate({
                path: "likedNotes",
                populate: [
                    {
                        path: "author",
                    },
                    {
                        path: "shared_event",
                    },
                ],
            })
                .populate({
                path: "inChats",
                populate: [
                    { path: "members" },
                    { path: "messages" },
                    { path: "event" },
                ],
            });
            //get events posted by user
            const userEvents = yield Event_1.default.find()
                .and([{ author: user._id }, { date: { $gte: new Date(Date.now()) } }])
                .populate("author")
                .populate("attenders");
            //get notes posted by user
            const userNotes = yield Note_1.default.find({ author: user._id })
                .populate("author")
                .populate({
                path: "shared_event",
                populate: {
                    path: "author",
                },
            })
                .populate("likedBy");
            //combine notes and events and sort array from newer to older
            const userPosts = [...userEvents, ...userNotes].sort((a, b) => {
                return (new Date(b.created_at).valueOf() - new Date(a.created_at).valueOf());
            });
            return res.status(200).json({ user, userPosts });
        }
        res.status(200).json({ err_message: "User not logged in." });
    }
    catch (err) {
        throw new AppError_1.default("There was an issue.", 500);
    }
});
exports.getUser = getUser;
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id } = req.params;
        //validate object_id
        if (mongoose_1.default.isValidObjectId(user_id)) {
            const user = yield User_1.default.findById(user_id)
                .populate({
                path: "attending",
                populate: {
                    path: "author",
                },
            })
                .populate({
                path: "savedEvents",
                populate: {
                    path: "author",
                },
            })
                .populate({
                path: "likedNotes",
                populate: [
                    {
                        path: "author",
                    },
                    {
                        path: "shared_event",
                    },
                ],
            })
                .populate("followers")
                .populate("following");
            //get user by id events
            const userEvents = yield Event_1.default.find()
                .and([{ author: user._id }, { date: { $gte: new Date(Date.now()) } }])
                .populate("author")
                .populate("reviews")
                .populate("attenders");
            //get user by id notes
            const userNotes = yield Note_1.default.find({ author: user._id })
                .populate("author")
                .populate({
                path: "shared_event",
                populate: {
                    path: "author",
                },
            })
                .populate("likedBy");
            //combine notes and events and sort from newer to older
            const userPosts = [...userEvents, ...userNotes].sort((a, b) => {
                return (new Date(b.created_at).valueOf() - new Date(a.created_at).valueOf());
            });
            if (user) {
                res.status(200).json({ user, userPosts });
            }
            else {
                res.status(200).json({ message: "No such user." });
            }
        }
        else {
            throw new AppError_1.default("Page not found", 404);
        }
    }
    catch (err) {
        throw new AppError_1.default("Page not found", 404);
    }
});
exports.getUserById = getUserById;
const getRecommendedUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { usernameSearch } = req.query;
        if (req.user && req.user._id) {
            //get current user
            const currentUser = yield User_1.default.findById(req.user._id)
                .populate("followers")
                .populate("following");
            //get all users
            const users = yield User_1.default.find()
                .and([
                (usernameSearch === null || usernameSearch === void 0 ? void 0 : usernameSearch.length) && typeof usernameSearch === "string"
                    ? { name: new RegExp(usernameSearch, "gi") }
                    : {},
                { _id: { $ne: currentUser._id } },
                { followers: { $ne: currentUser._id } },
            ])
                .populate("followers")
                .populate("following");
            //get users based on same country
            const localUsers = users.filter((user) => user.country !== currentUser.country);
            //get users based on mutual interests
            const interestUsers = localUsers.filter((user) => {
                const commonInterests = user.interests.filter((interest) => {
                    return currentUser.interests.includes(interest);
                });
                return ((currentUser.interests.length <= 3 && commonInterests.length >= 1) ||
                    commonInterests.length >= 2);
            });
            //get users, which are followed by the current users followers,
            //and sort them based on the number of mutual followers
            const mutualFollowerUsers = localUsers
                .map((user) => {
                const followingUsers = currentUser.following;
                let followerCount = 0;
                followingUsers.forEach((followingUser) => {
                    if (followingUser.following.includes(user._id)) {
                        followerCount += 1;
                    }
                });
                if (followerCount >= 1) {
                    return { mutualFollowerUser: user, followerCount };
                }
            })
                .sort((a, b) => a.followerCount - b.followerCount)
                .filter((el) => el)
                .map((el) => el === null || el === void 0 ? void 0 : el.mutualFollowerUser);
            //put all users in array, limit to 30, making sure to remove duplicates
            const keys = ["_id"];
            const recommendedUsers = [
                ...mutualFollowerUsers,
                ...interestUsers,
                ...localUsers.sort((a, b) => a.followers.length - b.followers.length),
                ...users.sort((a, b) => a.followers.length - b.followers.length),
            ].filter(((s) => (o) => ((k) => !s.has(k) && s.add(k))(keys.map((k) => o[k]).join("|")))(new Set()));
            return res.status(200).json({ recommendedUsers });
        }
        return res.status(200).json({ message: "Not logged in." });
    }
    catch (err) {
        throw new AppError_1.default("There was an issue.", 500);
    }
});
exports.getRecommendedUsers = getRecommendedUsers;
//POST - /api/user/login
//login user
const loginUser = (req, res) => {
    //login is handled in passport middleware, just send response
    res.status(200).json({ user: req.user });
};
exports.loginUser = loginUser;
//POST - /api/user/register
//register user
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password, age, country, city, interests, email, userTier, profileImage, } = req.body;
        //if userTier is free, register normally, else proceed to stripe payment
        if (userTier === userTiers_1.UserTiersTypes.standard ||
            userTier === userTiers_1.UserTiersTypes.creator) {
            //function to respond to client based on stripe intent
            const generateResponse = (intent) => __awaiter(void 0, void 0, void 0, function* () {
                if (intent.status === "requires_action" &&
                    intent.next_action.type === "use_stripe_sdk") {
                    // Tell the client to handle the action
                    res.status(200).json({
                        requires_action: true,
                        payment_intent_client_secret: intent.client_secret,
                    });
                }
                else if (intent.status === "succeeded") {
                    // Handle post-payment fulfillment
                    //create and register new user
                    const registeredUser = yield User_1.default.register({
                        username,
                        password,
                        age,
                        country,
                        city,
                        interests,
                        email,
                        userTier,
                        profileImage,
                    }, password);
                    //login new user
                    req.login(registeredUser, (err) => {
                        if (err) {
                            throw new AppError_1.default("There was a problem logging you in.", 500);
                        }
                        else {
                            res.status(200).json({ success: true, user: registeredUser });
                        }
                    });
                }
                else {
                    res.status(500).json({
                        error: "Invalid PaymentIntent status",
                    });
                }
            });
            try {
                let intent;
                if (req.body.payment_method_id) {
                    // Create the PaymentIntent
                    intent = yield stripe.paymentIntents.create({
                        payment_method: req.body.payment_method_id,
                        //amount must be in cents not dollars (2000 = 20$, 5000 = 50$)
                        amount: userTier === "standard" ? 2000 : 5000,
                        currency: "usd",
                        confirmation_method: "manual",
                        confirm: true,
                    });
                }
                else if (req.body.payment_intent_id) {
                    intent = yield stripe.paymentIntents.confirm(req.body.payment_intent_id);
                }
                // Send the response to the client
                generateResponse(intent);
            }
            catch (e) {
                // Display error on client
                return res.status(500).json({ err_message: e.message });
            }
        }
        else {
            //create and register new user
            const registeredUser = yield User_1.default.register({
                username,
                password,
                age,
                country,
                city,
                interests,
                email,
                userTier,
                profileImage,
            }, password);
            //login new user
            req.login(registeredUser, (err) => {
                if (err) {
                    res
                        .status(500)
                        .json({ err_message: "There was a problem logging you in." });
                }
                else {
                    res.status(200).json({ user: registeredUser });
                }
            });
        }
    }
    catch (err) {
        throw new AppError_1.default("There was a problem.", 500);
    }
});
exports.registerUser = registerUser;
//PUT - /api/user/edit
//edit user account
const editUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userData = req.body;
        //find and edit user
        const editedUser = yield User_1.default.findByIdAndUpdate(req.user._id, userData)
            .populate({
            path: "attending",
            populate: {
                path: "author",
            },
        })
            .populate("followers")
            .populate("following")
            .populate("savedEvents");
        editedUser
            ? res.status(200).json({ editedUser })
            : res.status(200).json({ message: "No such user" });
    }
    catch (_a) {
        res.status(500).json({
            err_message: "There was a problem, while editting you account.",
        });
    }
});
exports.editUser = editUser;
//GET - /api/user/logout
//logout user
const logoutUser = (req, res) => {
    //logout user through passport function
    req.logout();
    res.status(200).json({ message: "User logged out." });
};
exports.logoutUser = logoutUser;
//GET - /api/user/follow/:account_id
//handle the following of other users
const handleFollow = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { account_id = "" } = req.params;
        //validate object_id
        if (mongoose_1.default.isValidObjectId(account_id)) {
            const account = yield User_1.default.findById(account_id)
                .populate("attending")
                .populate("followers")
                .populate("following")
                .populate("savedEvents");
            if (account) {
                const user = yield User_1.default.findById(req.user._id);
                //check if user already follows account, if yes - unfollow, else follow
                if (user.following.find((followedUserId) => account._id === followedUserId)) {
                    //update current user
                    yield user.updateOne({ $pull: { following: account._id } }, { upsert: true });
                    //update unfollowed account
                    yield account.updateOne({ $pull: { followers: user._id } }, { upsert: true });
                    return res
                        .status(200)
                        .json({ message: "User unfollowed", unfollowedUser: account });
                }
                //update current user
                yield user.updateOne({ $push: { following: account._id } }, { upsert: true });
                //update followed account
                yield account.updateOne({ $push: { followers: user._id } }, { upsert: true });
                return res
                    .status(200)
                    .json({ message: "User followed", followedUser: account });
            }
            res.status(500).json({ message: "Account not found." });
        }
        else {
            throw new AppError_1.default("Page not found", 404);
        }
    }
    catch (_b) {
        throw new AppError_1.default("Page not found.", 404);
    }
});
exports.handleFollow = handleFollow;
//GET - /api/user/checkUser
//check if user data is valid
const checkUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.body;
    const foundUser = yield User_1.default.findOne({
        username: user.username,
        password: user.password,
    });
    res.status(200).json({ validData: foundUser ? true : false });
});
exports.checkUser = checkUser;
//GET - /api/user/checkUsername/:username
//check if username is available
const checkUsername = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.params;
    const foundUser = yield User_1.default.findOne({
        username,
    });
    res.status(200).json({ availableUsername: foundUser ? false : true });
});
exports.checkUsername = checkUsername;
