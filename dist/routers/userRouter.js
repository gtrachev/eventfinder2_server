"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const asyncWrap_1 = __importDefault(require("../utils/asyncWrap"));
const isLoggedIn_1 = __importDefault(require("../utils/middleware/isLoggedIn"));
const userController = __importStar(require("../controllers/userController"));
const joiValidators_1 = require("../utils/middleware/joiValidators");
const joiSchemas_1 = require("../utils/joi/joiSchemas");
const userRouters = express_1.default.Router();
//GET - /api/user/current
//return current user
userRouters.get("/current", (0, asyncWrap_1.default)(userController.getUser));
//GET - /api/user/by_id/:user_id
//return user by id
userRouters.get("/by_id/:user_id", (0, asyncWrap_1.default)(userController.getUserById));
//GET - /api/user/recommended
//return recommended users
userRouters.get("/recommended", (0, asyncWrap_1.default)(userController.getRecommendedUsers));
//POST - /api/user/login
//login user
userRouters.post("/login", passport_1.default.authenticate("local"), userController.loginUser);
//POST - /api/user/register
//register user
userRouters.post("/register", (0, asyncWrap_1.default)(userController.registerUser));
//PUT - /api/user/edit
//edit user account
userRouters.put("/edit", (req, res, next) => (0, joiValidators_1.validateBodyData)(joiSchemas_1.editUserJoiSchema, req, res, next), (0, asyncWrap_1.default)(userController.editUser));
//GET - /api/user/logout
//logout user
userRouters.get("/logout", isLoggedIn_1.default, userController.logoutUser);
//GET - /api/user/checkUser/:user
//check if user data is valid
userRouters.post("/checkUser", (req, res, next) => (0, joiValidators_1.validateBodyData)(joiSchemas_1.userLoginJoiSchema, req, res, next), (0, asyncWrap_1.default)(userController.checkUser));
//GET - /api/user/checkUsername/:username
//check if username is available
userRouters.get("/checkUsername/:username", (0, asyncWrap_1.default)(userController.checkUsername));
//GET - /api/user/follow/:account_id
//handle the following of other users
userRouters.get("/follow/:account_id", isLoggedIn_1.default, (0, asyncWrap_1.default)(userController.handleFollow));
exports.default = userRouters;
