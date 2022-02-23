"use strict";
console.log("ap");
import express from "express";
const app = express();
app.all("*", (req, res, next) => {
  next(new AppError("Page not found.", 404));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`LISTENING ON PORT: ${PORT} `);
});
