"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const asyncWrap = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch((err) => next(err));
    };
};
exports.default = asyncWrap;
