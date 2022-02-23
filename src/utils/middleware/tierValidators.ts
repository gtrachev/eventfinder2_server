import { NextFunction, Response } from "express";
import { differenceOfDates } from "../compareDates";
import { UserRequest } from "../types/modelTypes";
import { UserTiersTypes } from "../types/userTiers";

export const canCreate = async (
  req: UserRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user.userTier === UserTiersTypes.standard) {
    //if user has not posted return next
    if (!req.user.lastPosted) {
      return next();
    }
    //check if user has not posted in last 30 days, if yes return next
    if (differenceOfDates(req.user.lastPosted) >= 30) {
      return next();
    }
    res
      .status(401)
      .json({ err_message: "User has created an event in the past month." });
  } else if (req.user.userTier === UserTiersTypes.creator) {
    //if user has not posted return next
    if (!req.user.lastPosted) {
      return next();
    }
    //check if user has not posted in last 7 days, if yes return next
    if (differenceOfDates(req.user.lastPosted) >= 7) {
      return next();
    }
    res
      .status(401)
      .json({ err_message: "User has created an event in the past month." });
  } else {
    res
      .status(401)
      .json({ err_message: "User does not have required account tier." });
  }
};

// export const hasVerifiedCreatorTier = (
//   req: UserRequest,
//   res: Response,
//   next: NextFunction
// ) => {
//   if (req.user.userTier === UserTiersTypes.verifiedCreator) {
//     return next();
//   }
//   throw new AppError(
//     'You must have "Verified Creator Tier" to access this page.',
//     401
//   );
// };
