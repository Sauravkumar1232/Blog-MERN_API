import express from "express";
import {
  register,
  login,
  logOut,
  getMyProfile,
  getAuthors,
} from "../controller/userController.js";
import { isAuthenticated } from "../middleware/auth.js";
const router = express.Router();
router.post("/register", register);
router.post("/login", login);
router.get("/view", (req, res) => {
  res.status(200).json({
    success: true,
    message: "get",
  });
});
router.get("/logout", isAuthenticated, logOut);
router.get("/myProfile", isAuthenticated, getMyProfile);
router.get("/getAuthors", getAuthors);
export default router;
