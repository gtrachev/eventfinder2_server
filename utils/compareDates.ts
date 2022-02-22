export const differenceOfDates = (postedAt: Date) => {
  const currentDate = Date.now();
  const days = 1000 * 60 * 60 * 24;
  const dayDifference = new Date(currentDate).getTime() - postedAt.getTime();
  return Math.floor(dayDifference / days);
};
