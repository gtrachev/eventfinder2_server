"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewJoiSchema = exports.noteJoiSchema = exports.eventJoiSchema = exports.userLoginJoiSchema = exports.editUserJoiSchema = exports.userJoiSchema = void 0;
const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);
//joi request body validation schemas
exports.userJoiSchema = Joi.object({
    username: Joi.string().max(100).min(4).required(),
    email: Joi.string()
        .email({ tlds: { allow: false } })
        .required(),
    age: Joi.number().min(12).required(),
    country: Joi.string().min(2).max(50).required(),
    city: Joi.string().min(0).max(50),
    interests: Joi.array().min(1).max(10).required(),
    userTier: Joi.string().min(1).max(50).required(),
    profileImage: Joi.object({
        path: Joi.string().min(2),
        filename: Joi.string().min(2).max(100),
    }),
});
exports.editUserJoiSchema = Joi.object({
    age: Joi.number().min(12).required(),
    country: Joi.string().min(2).max(50).required(),
    city: Joi.string().min(0).max(50),
    interests: Joi.array().min(1).max(10).required(),
    userTier: Joi.string().min(1).max(50),
    profileImage: Joi.object({
        path: Joi.string().min(2),
        filename: Joi.string().min(2).max(100),
    }),
});
exports.userLoginJoiSchema = Joi.object({
    username: Joi.string().max(100).min(4).required(),
    password: Joi.string().min(4).required(),
});
exports.eventJoiSchema = Joi.object({
    name: Joi.string().min(1).max(100).required(),
    price: Joi.number().min(0).max(1000).required(),
    description: Joi.string().min(1).max(5000).required(),
    address: Joi.string().min(1).max(300).required(),
    date: Joi.date().min("now").required(),
    time: Joi.string()
        .regex(/^([0-9]{2})\:([0-9]{2})$/)
        .required(),
    city: Joi.string().min(1).max(100).required(),
    country: Joi.string().min(1).max(100).required(),
    interestCategories: Joi.array()
        .items(Joi.string().min(1).max(100).required())
        .max(5)
        .min(1)
        .required(),
    deletedImages: Joi.array().items(Joi.object({
        path: Joi.string().min(2).required(),
        filename: Joi.string().min(2).max(100).required(),
    })),
    ageGroup: Joi.string().min(1).max(100).required(),
    images: Joi.array()
        .items(Joi.object({
        path: Joi.string().min(2).required(),
        filename: Joi.string().min(2).max(100).required(),
    }))
        .min(1)
        .max(10)
        .required(),
});
exports.noteJoiSchema = Joi.object({
    body: Joi.string().min(0).max(250).required(),
    shared_event: Joi.string().allow("").optional(),
});
exports.reviewJoiSchema = Joi.object({
    text: Joi.string().min(0).max(250).required(),
});
