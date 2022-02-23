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
Object.defineProperty(exports, "__esModule", { value: true });
exports.canCreate = void 0;
const compareDates_1 = require("../compareDates");
const userTiers_1 = require("../types/userTiers");
const canCreate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.user.userTier === userTiers_1.UserTiersTypes.standard) {
        //if user has not posted return next
        if (!req.user.lastPosted) {
            return next();
        }
        //check if user has not posted in last 30 days, if yes return next
        if ((0, compareDates_1.differenceOfDates)(req.user.lastPosted) >= 30) {
            return next();
        }
        res
            .status(401)
            .json({ err_message: "User has created an event in the past month." });
    }
    else if (req.user.userTier === userTiers_1.UserTiersTypes.creator) {
        //if user has not posted return next
        if (!req.user.lastPosted) {
            return next();
        }
        //check if user has not posted in last 7 days, if yes return next
        if ((0, compareDates_1.differenceOfDates)(req.user.lastPosted) >= 7) {
            return next();
        }
        res
            .status(401)
            .json({ err_message: "User has created an event in the past month." });
    }
    else {
        res
            .status(401)
            .json({ err_message: "User does not have required account tier." });
    }
});
exports.canCreate = canCreate;
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
