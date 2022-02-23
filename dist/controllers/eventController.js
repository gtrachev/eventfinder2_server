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
exports.deleteEvent = exports.editEvent = exports.createEvent = exports.handleSave = exports.handleAttend = exports.getDetails = exports.getInterestEvents = exports.getPopularEvents = exports.getLocalEvents = void 0;
require("dotenv").config();
const Event_1 = __importDefault(require("../models/Event"));
const User_1 = __importDefault(require("../models/User"));
const AppError_1 = __importDefault(require("../utils/AppError"));
const mongoose_1 = __importDefault(require("mongoose"));
const geocoding_1 = __importDefault(require("@mapbox/mapbox-sdk/services/geocoding"));
const Chat_1 = __importDefault(require("../models/Chat"));
const mapBoxToken = process.env.MAP_BOX_TOKEN;
const geocoder = (0, geocoding_1.default)({ accessToken: mapBoxToken });
const cloudinary = require("cloudinary").v2;
//GET - /api/events/close_events
//return events in users location
const getLocalEvents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //get events in same city as user
    const localEvents = yield Event_1.default.find()
        .and([
        { country: req.user.country },
        { city: req.user.city },
        { date: { $gte: new Date(Date.now()) } },
    ])
        .populate("author")
        .populate("attenders")
        .sort({ attenders: 1 });
    //get events only in same country as user
    const countryEvents = yield Event_1.default.find()
        .and([
        { country: req.user.country },
        { date: { $gte: new Date(Date.now()) } },
    ])
        .populate("author")
        .populate("attenders")
        .sort({ attenders: 1 });
    //remove duplicates from events array
    const keys = ["_id"];
    const removedDuplicates = [...localEvents, ...countryEvents].filter(((s) => (o) => ((k) => !s.has(k) && s.add(k))(keys.map((k) => o[k]).join("|")))(new Set()));
    res.status(200).json({ events: removedDuplicates });
});
exports.getLocalEvents = getLocalEvents;
//GET - /api/events/popular_events
//return most popular events
const getPopularEvents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const popularEvents = yield Event_1.default.find({
        date: { $gte: new Date(Date.now()) },
    })
        .populate("author")
        .populate("attenders")
        .sort({ attenders: 1 })
        .limit(20);
    res.status(200).json({ events: popularEvents });
});
exports.getPopularEvents = getPopularEvents;
//GET - /api/events/interest_events
//return events based on users interests
const getInterestEvents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const events = yield Event_1.default.find({
        date: { $gte: new Date(Date.now()) },
    })
        .populate("author")
        .populate("attenders")
        .sort({ attenders: 1 });
    //get events with common interest categories as user
    const interestEvents = !events
        ? []
        : events
            .filter((event) => {
            const commonInterests = event.interestCategories.filter((interest) => {
                return req.user.interests.includes(interest);
            });
            return ((req.user.interests.length <= 3 && commonInterests.length >= 1) ||
                commonInterests.length >= 2);
        })
            .slice(0, 19);
    res.status(200).json({ events: interestEvents });
});
exports.getInterestEvents = getInterestEvents;
//GET - /api/events
//return all events
// export const getEvents = async (req: Request, res: Response) => {
//   const { search, price, interests, country, city, ageGroup } = req.query;
//   const interestsArray =
//     interests && typeof interests === "string" && interests.split(",");
//   const events = await Event.find()
//     .and([
//       search?.length && typeof search === "string"
//         ? { name: new RegExp(search, "gi") }
//         : {},
//       price ? { price: { $lte: price } } : {},
//       interestsArray && interestsArray?.length
//         ? { interestCategories: { $in: interestsArray } }
//         : {},
//       country?.length && typeof country === "string" ? { country } : {},
//       city?.length && typeof city === "string" ? { city: city } : {},
//       ageGroup?.length && typeof ageGroup === "string" ? { ageGroup } : {},
//       { date: { $gte: new Date(Date.now()) } },
//     ])
//     .populate("author")
//     .populate("attenders");
//   res.status(200).json({ events });
// };
//GET - /api/events/details/:event_id
//return event details
const getDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { event_id } = req.params;
        if (mongoose_1.default.isValidObjectId(event_id)) {
            const event = yield Event_1.default.findById(event_id)
                .populate("author")
                .populate({
                path: "reviews",
                populate: {
                    path: "author",
                },
            })
                .populate("attenders")
                .populate("chat");
            if (event) {
                res.status(200).json({ event });
            }
            else {
                res.status(500).json({ message: "No such event." });
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
exports.getDetails = getDetails;
//GET - /api/event/attend/:event_id
//attend or unattend event
const handleAttend = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { event_id } = req.params;
        //validate object_id
        if (mongoose_1.default.isValidObjectId(event_id)) {
            const event = yield Event_1.default.findById(event_id).populate("attenders");
            if (event) {
                const user = yield User_1.default.findById(req.user._id);
                const attendingEvents = user.attending;
                //check if user is attending event, if yes unattend, else attend
                if (attendingEvents.length &&
                    attendingEvents.find((attendingEvent) => event._id === attendingEvent)) {
                    //pull event from current user's attending events
                    yield user.updateOne({ $pull: { attending: event._id } }, { upsert: true });
                    //pull current user from events's attenders
                    yield event.updateOne({ $pull: { attenders: user._id } }, { upsert: true });
                    return res.status(200).json({ removedEvent: event, user });
                }
                //push event to current user's attending
                yield user.updateOne({ $push: { attending: event._id } }, { upsert: true });
                //push current user to events's attenders
                yield event.updateOne({ $push: { attenders: user._id } }, { upsert: true });
                res.status(200).json({ addedEvent: event, user });
            }
        }
        else {
            throw new AppError_1.default("Page not found", 404);
        }
    }
    catch (_a) {
        throw new AppError_1.default("Page not found.", 404);
    }
});
exports.handleAttend = handleAttend;
//GET - /api/events/save/:event_id
//save or unsave event
const handleSave = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { event_id } = req.params;
        //validate object_id
        if (mongoose_1.default.isValidObjectId(event_id)) {
            const event = yield Event_1.default.findById(event_id)
                .populate("author")
                .populate("reviews")
                .populate("attenders");
            if (event) {
                const user = yield User_1.default.findById(req.user._id);
                const savedEvents = user.savedEvents;
                //check if user has already saved the event, if yes, unsave else save
                if (savedEvents.length &&
                    savedEvents.find((savedEvent) => event._id === savedEvent)) {
                    //pull event from user's saved events
                    yield user.updateOne({ $pull: { savedEvents: event._id } }, { upsert: true });
                    return res.status(200).json({ unsavedEvent: event });
                }
                //push event to user's saved events
                yield user.updateOne({ $push: { savedEvents: event._id } }, { upsert: true });
                res.status(200).json({ savedEvent: event });
            }
            else {
                throw new AppError_1.default("Page not found", 404);
            }
        }
    }
    catch (err) {
        throw new AppError_1.default("Page not found.", 404);
    }
});
exports.handleSave = handleSave;
//POST - /api/events/create
//create event
const createEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const geoData = yield geocoder
        .forwardGeocode({
        query: req.body.address,
        limit: 1,
    })
        .send();
    //create new event
    const newEvent = new Event_1.default(req.body);
    //check if geo data is valid, if not assign default geo data
    if (geoData.body.features[0]) {
        newEvent.geometry = geoData.body.features[0].geometry;
    }
    else {
        newEvent.geometry = { type: "Point", coordinates: [23.33333, 42.7] };
    }
    const user = yield User_1.default.findById(req.user._id);
    newEvent.author = user._id;
    //create and assign a chat to the event
    const eventChat = new Chat_1.default({
        members: [newEvent.author],
        type: "group",
    });
    //assain the new chat event field with the new event
    eventChat.event = newEvent._id;
    yield eventChat.save();
    //add event author to the events chats
    yield user.updateOne({ $push: { inChats: eventChat } }, { upsert: true });
    //change the users last posted field
    //(this field determines whether a user can post an event in the canCreate middleware)
    user.lastPosted = new Date(Date.now());
    yield user.save();
    //assign the created chat to the new event
    newEvent.chat = eventChat;
    yield newEvent.save();
    res.status(200).json({ newEvent });
});
exports.createEvent = createEvent;
//PUT - /api/events/edit/:event_id
//edit event
const editEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { event_id } = req.params;
        if (mongoose_1.default.isValidObjectId(event_id)) {
            const { deletedImages, eventData } = req.body;
            const editedEvent = yield Event_1.default.findByIdAndUpdate(event_id, eventData)
                .populate("author")
                .populate("reviews")
                .populate("attenders");
            if (editedEvent) {
                //delete images from cloudinary
                if (deletedImages && deletedImages.length < editedEvent.images.length) {
                    deletedImages.forEach((image) => __awaiter(void 0, void 0, void 0, function* () {
                        yield cloudinary.uploader.destroy(image);
                    }));
                    //pull deleted images from editted event
                    yield editedEvent.updateOne({
                        $pull: { images: { filename: { $in: deletedImages } } },
                    });
                }
                return res.status(200).json({ editedEvent });
            }
            res.status(500).json({ message: "No such event." });
        }
        else {
            throw new AppError_1.default("Page not found", 404);
        }
    }
    catch (_b) {
        throw new AppError_1.default("Page not found.", 404);
    }
});
exports.editEvent = editEvent;
//DELETE - /api/events/delete/:event_id
//delete event
const deleteEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { event_id } = req.params;
        if (mongoose_1.default.isValidObjectId(event_id)) {
            const deletedEvent = yield Event_1.default.findByIdAndDelete(event_id);
            if (deletedEvent) {
                return res.status(200).json({ deletedEvent });
            }
            res.status(500).json({ message: "No such event." });
        }
        else {
            throw new AppError_1.default("Page not found", 404);
        }
    }
    catch (err) {
        throw new AppError_1.default("Page not found.", 404);
    }
});
exports.deleteEvent = deleteEvent;
