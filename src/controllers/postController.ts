import { Response } from "express";
import { UserRequest } from "../utils/types/modelTypes";
import Event from "../models/Event";
import { HydratedDocument } from "mongoose";
import { EventType, NoteType } from "../utils/types/modelTypes";
import Note from "../models/Note";
import { differenceOfDates } from "../utils/compareDates";
import AppError from "../utils/AppError";

//GET - /api/posts/following/:fromDays
//Get following posts
export const getFollowingPosts = async (req: UserRequest, res: Response) => {
  try {
    const followingUsers = req.user.following;
    const fromDays = parseInt(req.params.fromDays);

    //get events from accounts, followed by user
    const followingEvents: any = await Promise.all(
      followingUsers.map(async (followingUser) => {
        const followingUsersEvents: HydratedDocument<EventType>[] | null =
          await Event.find()
            .and([
              { author: followingUser },
              { date: { $gte: new Date(Date.now()) } },
            ])
            .populate("author")
            .populate("attenders");
        return followingUsersEvents ? followingUsersEvents : [];
      })
    );
    //filter the events, only to those posted in the last fromDays
    const filteredFollowingEvents = followingEvents.length
      ? followingEvents[0].filter((event: EventType) => {
          return differenceOfDates(event.created_at) <= fromDays;
        })
      : [];

    //get notes from accounts, followed by user
    const followingNotes: any = await Promise.all(
      followingUsers.map(async (followingUser) => {
        const followingUsersNotes: HydratedDocument<NoteType>[] | null =
          await Note.find({
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
      })
    );
    //filter those notes, only to those posted in the last fromDays
    const filteredFollowingNotes = followingNotes.length
      ? followingNotes[0].filter((note: NoteType) => {
          return differenceOfDates(note.created_at) <= fromDays;
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
  } catch (err) {
    throw new AppError("There was an issue.", 500);
  }
};
