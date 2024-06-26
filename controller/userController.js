import { catchAsyncError } from "../middleware/catchAsyncError.js";
import ErrorHandler from "../middleware/error.js";
import { User } from "../model/userSchema.js";
import { Blog } from "../model/blogSchema.js";

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

export const login = async (req, res, next) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    return next(new ErrorHandler("Please Fill full details", 400));
  }
  const user = await User.findOne({ email }).select("+password"); // find user with password also
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
};

export const logOut = catchAsyncError(async (req, res, next) => {
  res
    .cookie("token", "", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      expires: new Date(1),
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

export const getPopularAuthors = catchAsyncError(async (req, res, next) => {
  try {
    // Fetch all authors
    const authors = await User.find({ role: "Author" });

    const authorsWithRating = await Promise.all(
      authors.map(async (author) => {
        const blogs = await Blog.find({
          createdBy: author._id,
          published: true,
        });
        const totalRating = blogs.reduce((acc, blog) => acc + blog.rating, 0);

        return {
          author,
          totalRating,
        };
      })
    );

    // Sort authors by average blog rating in descending order
    const popularAuthors = authorsWithRating.sort(
      (a, b) => b.totalRating - a.totalRating
    );
    res.status(200).json({
      success: true,
      message: "Fetching popular authors",
      popularAuthors,
    });
  } catch (error) {
    console.error("Error fetching popular authors:", error);
    throw error;
  }
});
