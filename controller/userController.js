import { catchAsyncError } from "../middleware/catchAsyncError.js";
import ErrorHandler from "../middleware/error.js";
import { User } from "../model/userSchema.js";
import { sendToken } from "../utils/jwtToken.js";
import cloudinary from "cloudinary";
export const register = catchAsyncError(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("User Avtar Required", 400));
  }
  const { avatar } = req.files;
  const allowedFormats = ["image/png", "image.jpg", "image/webp"];
  if (!allowedFormats.includes(avatar.mimetype)) {
    return next(
      new ErrorHandler(
        "Invalid File Type . Please Provide Valid Type of file",
        400
      )
    );
  }

  const { name, email, password, phone, role, education } = req.body;
  if (
    !name ||
    !email ||
    !password ||
    !phone ||
    !role ||
    !education ||
    !avatar
  ) {
    return next(new ErrorHandler("Please fill full Details", 400));
  }

  let isEmail = await User.findOne({ email });
  if (isEmail) {
    return next(new ErrorHandler("User already exists", 400));
  }

  const cloudinaryResponse = await cloudinary.uploader.upload(
    avatar.tempFilePath
  );
  if (!cloudinaryResponse || cloudinaryResponse.error) {
    console.error(
      "Cloudinary Error",
      cloudinaryResponse.error || "unknown cloudinary error"
    );
  }
  const user = await User.create({
    name,
    email,
    password,
    phone,
    role,
    education,
    avatar: {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    },
  });
  sendToken(user, 200, "User registered successfully", res);
  // res.status(200).json({
  //   success: true,
  //   message: "User registered",
  // });
});

export const login = catchAsyncError(async (req, res, next) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    return next(new ErrorHandler("Please Fill full details", 400));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid email or password", 400));
  }
  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    return next(new ErrorHandler("Invalid email or password", 400));
  }
  if (user.role != role) {
    return next(
      new ErrorHandler(` User with provided role (${role}) not found`, 400)
    );
  }
  sendToken(user, 200, "User logged in successfully", res);

  // res.status(200).json({
  //   success: true,
  //   message: "User logged in",
  // });
});

export const logOut = catchAsyncError(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", "", {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .json({
      success: true,
      message: "User logged out",
    });
});

export const getMyProfile = catchAsyncError((req, res, next) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user,
  });
});
export const getAuthors = catchAsyncError(async (req, res, next) => {
  let authors = await User.find({ role: "Author" });
  res.status(200).json({
    success: true,
    authors,
  });
});
