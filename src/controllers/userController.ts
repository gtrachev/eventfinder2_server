require("dotenv").config();
import { Request, Response } from "express";
import { HydratedDocument, ObjectId } from "mongoose";
import User from "../models/User";
import Event from "../models/Event";
import AppError from "../utils/AppError";
import { UserRequest, UserType } from "../utils/types/modelTypes";
import Note from "../models/Note";
import mongoose from "mongoose";
import { UserTiersTypes } from "../utils/types/userTiers";
const stripe = require("stripe")(
  `sk_test_51KRiOiEKyWrvmmLo7mahBY5U904vqbnY5Hx7JNDZSGZTsR2EX1Q7XkQhXK0KieJUb5npuy25QaILg4PgRQy3Hccr00Ngs7z7ap`
);

//GET - /api/user/current
//return current user
export const getUser = async (req: UserRequest, res: Response) => {
  try {
    if (req.user) {
      const user = await User.findById(req.user._id)
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
      const userEvents = await Event.find()
        .and([{ author: user._id }, { date: { $gte: new Date(Date.now()) } }])
        .populate("author")
        .populate("attenders");
      //get notes posted by user
      const userNotes = await Note.find({ author: user._id })
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
        return (
          new Date(b.created_at).valueOf() - new Date(a.created_at).valueOf()
        );
      });

      return res.status(200).json({ user, userPosts });
    }
    res.status(200).json({ err_message: "User not logged in." });
  } catch (err) {
    throw new AppError("There was an issue.", 500);
  }
};

export const getUserById = async (req: UserRequest, res: Response) => {
  try {
    const { user_id } = req.params;
    //validate object_id
    if (mongoose.isValidObjectId(user_id)) {
      const user = await User.findById(user_id)
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
      const userEvents = await Event.find()
        .and([{ author: user._id }, { date: { $gte: new Date(Date.now()) } }])
        .populate("author")
        .populate("reviews")
        .populate("attenders");
      //get user by id notes
      const userNotes = await Note.find({ author: user._id })
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
        return (
          new Date(b.created_at).valueOf() - new Date(a.created_at).valueOf()
        );
      });

      if (user) {
        res.status(200).json({ user, userPosts });
      } else {
        res.status(200).json({ message: "No such user." });
      }
    } else {
      throw new AppError("Page not found", 404);
    }
  } catch (err) {
    throw new AppError("Page not found", 404);
  }
};

export const getRecommendedUsers = async (req: UserRequest, res: Response) => {
  try {
    const { usernameSearch } = req.query;

    if (req.user && req.user._id) {
      //get current user
      const currentUser = await User.findById(req.user._id)
        .populate("followers")
        .populate("following");

      //get all users
      const users = await User.find()
        .and([
          usernameSearch?.length && typeof usernameSearch === "string"
            ? { name: new RegExp(usernameSearch, "gi") }
            : {},
          { _id: { $ne: currentUser._id } },
          { followers: { $ne: currentUser._id } },
        ])
        .populate("followers")
        .populate("following");

      //get users based on same country
      const localUsers = users.filter(
        (user: UserType) => user.country !== currentUser.country
      );

      //get users based on mutual interests
      const interestUsers = localUsers.filter((user: UserType) => {
        const commonInterests = user.interests.filter((interest: string) => {
          return currentUser.interests.includes(interest);
        });
        return (
          (currentUser.interests.length <= 3 && commonInterests.length >= 1) ||
          commonInterests.length >= 2
        );
      });

      //get users, which are followed by the current users followers,
      //and sort them based on the number of mutual followers
      const mutualFollowerUsers = localUsers
        .map((user: UserType) => {
          const followingUsers = currentUser.following;
          let followerCount = 0;
          followingUsers.forEach((followingUser: UserType) => {
            if (followingUser.following.includes(user._id)) {
              followerCount += 1;
            }
          });
          if (followerCount >= 1) {
            return { mutualFollowerUser: user, followerCount };
          }
        })
        .sort((a: any, b: any) => a!.followerCount - b!.followerCount)
        .filter((el: any) => el)
        .map((el: any) => el?.mutualFollowerUser);

      //put all users in array, limit to 30, making sure to remove duplicates
      const keys = ["_id"];
      const recommendedUsers = [
        ...mutualFollowerUsers,
        ...interestUsers,
        ...localUsers.sort(
          (a: any, b: any) => a.followers.length - b.followers.length
        ),
        ...users.sort(
          (a: any, b: any) => a.followers.length - b.followers.length
        ),
      ].filter(
        (
          (s) => (o: any) =>
            ((k) => !s.has(k) && s.add(k))(keys.map((k) => o[k]).join("|"))
        )(new Set())
      );

      return res.status(200).json({ recommendedUsers });
    }
    return res.status(200).json({ message: "Not logged in." });
  } catch (err) {
    throw new AppError("There was an issue.", 500);
  }
};

//POST - /api/user/login
//login user
export const loginUser = (req: Request, res: Response) => {
  //login is handled in passport middleware, just send response
  console.log(req);
  res.status(200).json({ user: req.user });
};

//POST - /api/user/register
//register user
export const registerUser = async (req: Request, res: Response) => {
  try {
    const {
      username,
      password,
      age,
      country,
      city,
      interests,
      email,
      userTier,
      profileImage,
    } = req.body;

    //if userTier is free, register normally, else proceed to stripe payment
    if (
      userTier === UserTiersTypes.standard ||
      userTier === UserTiersTypes.creator
    ) {
      //function to respond to client based on stripe intent
      const generateResponse = async (intent: any) => {
        if (
          intent.status === "requires_action" &&
          intent.next_action.type === "use_stripe_sdk"
        ) {
          // Tell the client to handle the action
          res.status(200).json({
            requires_action: true,
            payment_intent_client_secret: intent.client_secret,
          });
        } else if (intent.status === "succeeded") {
          // Handle post-payment fulfillment
          //create and register new user
          const registeredUser: HydratedDocument<UserType> =
            await User.register(
              {
                username,
                password,
                age,
                country,
                city,
                interests,
                email,
                userTier,
                profileImage,
              },
              password
            );
          //login new user
          req.login(registeredUser, (err) => {
            if (err) {
              throw new AppError("There was a problem logging you in.", 500);
            } else {
              res.status(200).json({ success: true, user: registeredUser });
            }
          });
        } else {
          res.status(500).json({
            error: "Invalid PaymentIntent status",
          });
        }
      };
      try {
        let intent;
        if (req.body.payment_method_id) {
          // Create the PaymentIntent
          intent = await stripe.paymentIntents.create({
            payment_method: req.body.payment_method_id,
            //amount must be in cents not dollars (2000 = 20$, 5000 = 50$)
            amount: userTier === "standard" ? 2000 : 5000,
            currency: "usd",
            confirmation_method: "manual",
            confirm: true,
          });
        } else if (req.body.payment_intent_id) {
          intent = await stripe.paymentIntents.confirm(
            req.body.payment_intent_id
          );
        }
        // Send the response to the client
        generateResponse(intent);
      } catch (e: any) {
        // Display error on client
        return res.status(500).json({ err_message: e.message });
      }
    } else {
      //create and register new user
      const registeredUser: HydratedDocument<UserType> = await User.register(
        {
          username,
          password,
          age,
          country,
          city,
          interests,
          email,
          userTier,
          profileImage,
        },
        password
      );

      //login new user
      req.login(registeredUser, (err) => {
        if (err) {
          res
            .status(400)
            .json({ err_message: "There was a problem logging you in." });
        } else {
          res.status(200).json({ user: registeredUser });
        }
      });
    }
  } catch (err) {
    throw new AppError("There was a problem.", 500);
  }
};

//PUT - /api/user/edit
//edit user account
export const editUser = async (req: UserRequest, res: Response) => {
  try {
    const userData = req.body;
    //find and edit user
    const editedUser = await User.findByIdAndUpdate(req.user._id, userData)
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
  } catch {
    res.status(500).json({
      err_message: "There was a problem, while editting you account.",
    });
  }
};

//GET - /api/user/logout
//logout user
export const logoutUser = (req: Request, res: Response) => {
  //logout user through passport function
  req.logout();
  res.status(200).json({ message: "User logged out." });
};

//GET - /api/user/follow/:account_id
//handle the following of other users
export const handleFollow = async (req: UserRequest, res: Response) => {
  try {
    const { account_id = "" } = req.params;
    //validate object_id
    if (mongoose.isValidObjectId(account_id)) {
      const account: HydratedDocument<UserType> | null = await User.findById(
        account_id
      )
        .populate("attending")
        .populate("followers")
        .populate("following")
        .populate("savedEvents");
      if (account) {
        const user = await User.findById(req.user._id);
        //check if user already follows account, if yes - unfollow, else follow
        if (
          user.following.find(
            (followedUserId: ObjectId) => account._id === followedUserId
          )
        ) {
          //update current user
          await user.updateOne(
            { $pull: { following: account._id } },
            { upsert: true }
          );
          //update unfollowed account
          await account.updateOne(
            { $pull: { followers: user._id } },
            { upsert: true }
          );
          return res
            .status(200)
            .json({ message: "User unfollowed", unfollowedUser: account });
        }
        //update current user
        await user.updateOne(
          { $push: { following: account._id } },
          { upsert: true }
        );
        //update followed account
        await account.updateOne(
          { $push: { followers: user._id } },
          { upsert: true }
        );

        return res
          .status(200)
          .json({ message: "User followed", followedUser: account });
      }
      res.status(500).json({ message: "Account not found." });
    } else {
      throw new AppError("Page not found", 404);
    }
  } catch {
    throw new AppError("Page not found.", 404);
  }
};

//GET - /api/user/checkUser
//check if user data is valid
export const checkUser = async (req: Request, res: Response) => {
  const user = req.body;

  const foundUser: HydratedDocument<UserType> | null = await User.findOne({
    username: user.username,
    password: user.password,
  });

  res.status(200).json({ validData: foundUser ? true : false });
};

//GET - /api/user/checkUsername/:username
//check if username is available
export const checkUsername = async (req: Request, res: Response) => {
  const { username } = req.params;

  const foundUser: HydratedDocument<UserType> | null = await User.findOne({
    username,
  });
  res.status(200).json({ availableUsername: foundUser ? false : true });
};
