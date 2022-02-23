import express, { Request, Response, NextFunction } from "express";
import * as eventController from "../controllers/eventController";
import asyncWrap from "../utils/asyncWrap";
import isLoggedIn from "../utils/middleware/isLoggedIn";
import { validateBodyData } from "../utils/middleware/joiValidators";
import { eventJoiSchema } from "../utils/joi/joiSchemas";
import isEventAuthor from "../utils/middleware/isEventAuthor";
import { isEventExpired } from "../utils/middleware/isEventExpired";
import { canCreate } from "../utils/middleware/tierValidators";
const eventsRouter = express.Router();

//GET - /api/events/close_events
//return events in users location
eventsRouter.get(
  "/close_events",
  isLoggedIn,
  asyncWrap(eventController.getLocalEvents)
);

//GET - /api/events/popular_events
//return the most popular events
eventsRouter.get(
  "/popular_events",
  asyncWrap(eventController.getPopularEvents)
);

//GET - /api/events/interest_events
//return events based on users interests
eventsRouter.get(
  "/interest_events",
  isLoggedIn,
  asyncWrap(eventController.getInterestEvents)
);

//GET - /api/events
//return all events
// eventsRouter.get("/", asyncWrap(eventController.getEvents));

//GET - /api/events/details/:event_id
//return event details
eventsRouter.get(
  "/details/:event_id",
  isEventExpired,
  asyncWrap(eventController.getDetails)
);

//GET - /api/events/attend/:event_id
//attend or unattend event
eventsRouter.get(
  "/attend/:event_id",
  isLoggedIn,
  isEventExpired,
  asyncWrap(eventController.handleAttend)
);

//GET - /api/events/save/:event_id
//save or unsave event
eventsRouter.get(
  "/save/:event_id",
  isLoggedIn,
  isEventExpired,
  asyncWrap(eventController.handleSave)
);

//POST - /api/events/create
//create event
eventsRouter.post(
  "/create",
  isLoggedIn,
  asyncWrap(canCreate),
  (req: Request, res: Response, next: NextFunction) =>
    validateBodyData(eventJoiSchema, req, res, next),
  asyncWrap(eventController.createEvent)
);

//PUT - /api/events/edit/:event_id
//edit event
eventsRouter.put(
  "/edit/:event_id",
  isLoggedIn,
  isEventAuthor,
  isEventExpired,
  asyncWrap(eventController.editEvent)
);

//DELETE - /api/events/delete/:event_id
//delete event
eventsRouter.delete(
  "/delete/:event_id",
  isLoggedIn,
  isEventAuthor,
  asyncWrap(eventController.deleteEvent)
);

export default eventsRouter;
