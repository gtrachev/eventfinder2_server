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
const eventController = __importStar(require("../controllers/eventController"));
const asyncWrap_1 = __importDefault(require("../utils/asyncWrap"));
const isLoggedIn_1 = __importDefault(require("../utils/middleware/isLoggedIn"));
const joiValidators_1 = require("../utils/middleware/joiValidators");
const joiSchemas_1 = require("../utils/joi/joiSchemas");
const isEventAuthor_1 = __importDefault(require("../utils/middleware/isEventAuthor"));
const isEventExpired_1 = require("../utils/middleware/isEventExpired");
const tierValidators_1 = require("../utils/middleware/tierValidators");
const eventsRouter = express_1.default.Router();
//GET - /api/events/close_events
//return events in users location
eventsRouter.get("/close_events", isLoggedIn_1.default, (0, asyncWrap_1.default)(eventController.getLocalEvents));
//GET - /api/events/popular_events
//return the most popular events
eventsRouter.get("/popular_events", (0, asyncWrap_1.default)(eventController.getPopularEvents));
//GET - /api/events/interest_events
//return events based on users interests
eventsRouter.get("/interest_events", isLoggedIn_1.default, (0, asyncWrap_1.default)(eventController.getInterestEvents));
//GET - /api/events
//return all events
// eventsRouter.get("/", asyncWrap(eventController.getEvents));
//GET - /api/events/details/:event_id
//return event details
eventsRouter.get("/details/:event_id", isEventExpired_1.isEventExpired, (0, asyncWrap_1.default)(eventController.getDetails));
//GET - /api/events/attend/:event_id
//attend or unattend event
eventsRouter.get("/attend/:event_id", isLoggedIn_1.default, isEventExpired_1.isEventExpired, (0, asyncWrap_1.default)(eventController.handleAttend));
//GET - /api/events/save/:event_id
//save or unsave event
eventsRouter.get("/save/:event_id", isLoggedIn_1.default, isEventExpired_1.isEventExpired, (0, asyncWrap_1.default)(eventController.handleSave));
//POST - /api/events/create
//create event
eventsRouter.post("/create", isLoggedIn_1.default, (0, asyncWrap_1.default)(tierValidators_1.canCreate), (req, res, next) => (0, joiValidators_1.validateBodyData)(joiSchemas_1.eventJoiSchema, req, res, next), (0, asyncWrap_1.default)(eventController.createEvent));
//PUT - /api/events/edit/:event_id
//edit event
eventsRouter.put("/edit/:event_id", isLoggedIn_1.default, isEventAuthor_1.default, isEventExpired_1.isEventExpired, (0, asyncWrap_1.default)(eventController.editEvent));
//DELETE - /api/events/delete/:event_id
//delete event
eventsRouter.delete("/delete/:event_id", isLoggedIn_1.default, isEventAuthor_1.default, (0, asyncWrap_1.default)(eventController.deleteEvent));
exports.default = eventsRouter;
