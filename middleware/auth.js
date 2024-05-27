// Auhtentication  =  the process of verifying who someone is

import { catchAsyncError } from "./catchAsyncError.js";
import ErrorHandler from "../middleware/error.js";
import jwt from "jsonwebtoken";
import { User } from "../model/userSchema.js";

export const isAuthenticated = catchAsyncError(async (req, res, next) => {
  const { token } = req.cookies;
  console.log(token, "token from auth");
  if (!token) {
    return next(new ErrorHandler("User is not authenticated", 401));
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  req.user = await User.findById(decoded.id);
  next();
});

//Authorization  = the process of verifying what specific applications, files, and data a user has access to
export const isAuthorized = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `User with this role(${req.user.role}) not allowed to access this resource`
        )
      );
    }
    next();
  };
};
