require("dotenv").config();
import { Request, Response } from "express";
import Event from "../models/Event";
import User from "../models/User";
import AppError from "../utils/AppError";
import mongoose from "mongoose";
import {
  EventType,
  UserRequest,
  UserType,
  ImageType,
  ChatType,
} from "../utils/types/modelTypes";
import mbxGeocoding from "@mapbox/mapbox-sdk/services/geocoding";
import { HydratedDocument, ObjectId } from "mongoose";
import Chat from "../models/Chat";
const mapBoxToken = process.env.MAP_BOX_TOKEN as string;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const cloudinary = require("cloudinary").v2;

//GET - /api/events/close_events
//return events in users location
export const getLocalEvents = async (req: UserRequest, res: Response) => {
  //get events in same city as user
  const localEvents = await Event.find()
    .and([
      { country: req.user.country },
      { city: req.user.city },
      { date: { $gte: new Date(Date.now()) } },
    ])
    .populate("author")
    .populate("attenders")
    .sort({ attenders: 1 });
  //get events only in same country as user
  const countryEvents = await Event.find()
    .and([
      { country: req.user.country },
      { date: { $gte: new Date(Date.now()) } },
    ])
    .populate("author")
    .populate("attenders")
    .sort({ attenders: 1 });

  //remove duplicates from events array
  const keys = ["_id"];
  const removedDuplicates = [...localEvents, ...countryEvents].filter(
    (
      (s: any) => (o: any) =>
        ((k: any) => !s.has(k) && s.add(k))(keys.map((k) => o[k]).join("|"))
    )(new Set())
  );

  res.status(200).json({ events: removedDuplicates });
};

//GET - /api/events/popular_events
//return most popular events
export const getPopularEvents = async (req: Request, res: Response) => {
  const popularEvents: HydratedDocument<EventType>[] | null = await Event.find()
    .and([
      {
        date: { $gte: new Date(Date.now()) },
      },
    ])
    .populate("author")
    .populate("attenders")
    .sort({ attenders: 1 })
    .limit(20);
  res.status(200).json({ events: popularEvents });
};

//GET - /api/events/interest_events
//return events based on users interests
export const getInterestEvents = async (req: UserRequest, res: Response) => {
  const events: HydratedDocument<EventType>[] | null = await Event.find()
    .and([
      {
        date: { $gte: new Date(Date.now()) },
      },
    ])
    .populate("author")
    .populate("attenders")
    .sort({ attenders: 1 });
  //get events with common interest categories as user
  const interestEvents = !events
    ? []
    : events
        .filter((event) => {
          const commonInterests = event.interestCategories.filter(
            (interest) => {
              return req.user.interests.includes(interest);
            }
          );
          return (
            (req.user.interests.length <= 3 && commonInterests.length >= 1) ||
            commonInterests.length >= 2
          );
        })
        .slice(0, 19);
  res.status(200).json({ events: interestEvents });
};

//GET - /api/events
//return all events
export const getEvents = async (req: Request, res: Response) => {
  const { search, price, interests, country, city, ageGroup } = req.query;
  const interestsArray =
    interests && typeof interests === "string" && interests.split(",");
  const events = await Event.find()
    .and([
      search?.length && typeof search === "string"
        ? { name: new RegExp(search, "gi") }
        : {},
      price ? { price: { $lte: price } } : {},
      interestsArray && interestsArray?.length
        ? { interestCategories: { $in: interestsArray } }
        : {},
      country?.length && typeof country === "string" ? { country } : {},
      city?.length && typeof city === "string" ? { city: city } : {},
      ageGroup?.length && typeof ageGroup === "string" ? { ageGroup } : {},
      { date: { $gte: new Date(Date.now()) } },
    ])
    .populate("author")
    .populate("attenders");

  res.status(200).json({ events });
};

//GET - /api/events/details/:event_id
//return event details
export const getDetails = async (req: Request, res: Response) => {
  try {
    const { event_id } = req.params;
    if (mongoose.isValidObjectId(event_id)) {
      const event: HydratedDocument<EventType> | null = await Event.findById(
        event_id
      )
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
      } else {
        res.status(500).json({ message: "No such event." });
      }
    } else {
      throw new AppError("Page not found", 404);
    }
  } catch (err) {
    throw new AppError("Page not found", 404);
  }
};

//GET - /api/event/attend/:event_id
//attend or unattend event
export const handleAttend = async (req: UserRequest, res: Response) => {
  try {
    const { event_id } = req.params;
    //validate object_id
    if (mongoose.isValidObjectId(event_id)) {
      const event: HydratedDocument<EventType> | null = await Event.findById(
        event_id
      ).populate("attenders");
      if (event) {
        const user = await User.findById(req.user._id);
        const attendingEvents = user.attending;
        //check if user is attending event, if yes unattend, else attend
        if (
          attendingEvents.length &&
          attendingEvents.find(
            (attendingEvent: ObjectId) => event._id === attendingEvent
          )
        ) {
          //pull event from current user's attending events
          await user.updateOne(
            { $pull: { attending: event._id } },
            { upsert: true }
          );
          //pull current user from events's attenders
          await event.updateOne(
            { $pull: { attenders: user._id } },
            { upsert: true }
          );
          return res.status(200).json({ removedEvent: event, user });
        }
        //push event to current user's attending
        await user.updateOne(
          { $push: { attending: event._id } },
          { upsert: true }
        );
        //push current user to events's attenders
        await event.updateOne(
          { $push: { attenders: user._id } },
          { upsert: true }
        );
        res.status(200).json({ addedEvent: event, user });
      }
    } else {
      throw new AppError("Page not found", 404);
    }
  } catch {
    throw new AppError("Page not found.", 404);
  }
};

//GET - /api/events/save/:event_id
//save or unsave event
export const handleSave = async (req: UserRequest, res: Response) => {
  try {
    const { event_id } = req.params;
    //validate object_id
    if (mongoose.isValidObjectId(event_id)) {
      const event: HydratedDocument<EventType> | null = await Event.findById(
        event_id
      )
        .populate("author")
        .populate("reviews")
        .populate("attenders");
      if (event) {
        const user = await User.findById(req.user._id);
        const savedEvents = user.savedEvents;
        //check if user has already saved the event, if yes, unsave else save
        if (
          savedEvents.length &&
          savedEvents.find((savedEvent: ObjectId) => event._id === savedEvent)
        ) {
          //pull event from user's saved events
          await user.updateOne(
            { $pull: { savedEvents: event._id } },
            { upsert: true }
          );
          return res.status(200).json({ unsavedEvent: event });
        }
        //push event to user's saved events
        await user.updateOne(
          { $push: { savedEvents: event._id } },
          { upsert: true }
        );
        res.status(200).json({ savedEvent: event });
      } else {
        throw new AppError("Page not found", 404);
      }
    }
  } catch (err) {
    throw new AppError("Page not found.", 404);
  }
};

//POST - /api/events/create
//create event
export const createEvent = async (req: UserRequest, res: Response) => {
  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.address,
      limit: 1,
    })
    .send();
  //create new event
  const newEvent: HydratedDocument<EventType> = new Event(req.body);
  //check if geo data is valid, if not assign default geo data
  if (geoData.body.features[0]) {
    newEvent.geometry = geoData.body.features[0].geometry;
  } else {
    newEvent.geometry = { type: "Point", coordinates: [23.33333, 42.7] };
  }
  const user = await User.findById(req.user._id);
  newEvent.author = user._id;
  //create and assign a chat to the event
  const eventChat: HydratedDocument<ChatType> = new Chat({
    members: [newEvent.author],
    type: "group",
  });
  //assain the new chat event field with the new event
  eventChat.event = newEvent._id;
  await eventChat.save();
  //add event author to the events chats
  await user.updateOne({ $push: { inChats: eventChat } }, { upsert: true });
  //change the users last posted field
  //(this field determines whether a user can post an event in the canCreate middleware)
  user.lastPosted = new Date(Date.now());
  await user.save();
  //assign the created chat to the new event
  newEvent.chat = eventChat;
  await newEvent.save();
  res.status(200).json({ newEvent });
};

//PUT - /api/events/edit/:event_id
//edit event
export const editEvent = async (req: UserRequest, res: Response) => {
  try {
    const { event_id } = req.params;
    if (mongoose.isValidObjectId(event_id)) {
      const { deletedImages, eventData } = req.body;
      const editedEvent: HydratedDocument<EventType> | null =
        await Event.findByIdAndUpdate(event_id, eventData)
          .populate("author")
          .populate("reviews")
          .populate("attenders");
      if (editedEvent) {
        //delete images from cloudinary
        if (deletedImages && deletedImages.length < editedEvent.images.length) {
          deletedImages.forEach(async (image: ImageType) => {
            await cloudinary.uploader.destroy(image);
          });
          //pull deleted images from editted event
          await editedEvent.updateOne({
            $pull: { images: { filename: { $in: deletedImages } } },
          });
        }

        return res.status(200).json({ editedEvent });
      }
      res.status(500).json({ message: "No such event." });
    } else {
      throw new AppError("Page not found", 404);
    }
  } catch {
    throw new AppError("Page not found.", 404);
  }
};

//DELETE - /api/events/delete/:event_id
//delete event
export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const { event_id } = req.params;
    if (mongoose.isValidObjectId(event_id)) {
      const deletedEvent: HydratedDocument<EventType> | null =
        await Event.findByIdAndDelete(event_id);
      if (deletedEvent) {
        return res.status(200).json({ deletedEvent });
      }
      res.status(500).json({ message: "No such event." });
    } else {
      throw new AppError("Page not found", 404);
    }
  } catch (err) {
    throw new AppError("Page not found.", 404);
  }
};
