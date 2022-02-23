"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.differenceOfDates = void 0;
const differenceOfDates = (postedAt) => {
    const currentDate = Date.now();
    const days = 1000 * 60 * 60 * 24;
    const dayDifference = new Date(currentDate).getTime() - postedAt.getTime();
    return Math.floor(dayDifference / days);
};
exports.differenceOfDates = differenceOfDates;
