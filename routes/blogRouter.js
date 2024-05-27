import express from "express";
import { isAuthenticated, isAuthorized } from "../middleware/auth.js";
import {
  blogPost,
  deleteBlog,
  getAllBlog,
  getMyBlogs,
  getSingleBlog,
  updateBlog,
  blogRating,
  getTrandingBlog,
} from "../controller/blogController.js";
const router = express.Router();

router.post("/post", isAuthenticated, isAuthorized("Author"), blogPost);
router.post("/rating/:id", blogRating);

router.delete(
  "/delete/:id",
  isAuthenticated,
  isAuthorized("Author"),
  deleteBlog
);

router.get("/getAll", getAllBlog);
router.get("/getTrandingBlog", getTrandingBlog);
router.get("/getSingle/:id", getSingleBlog);
router.get("/getMyBlog", isAuthenticated, isAuthorized("Author"), getMyBlogs);
router.put("/update/:id", isAuthenticated, isAuthorized("Author"), updateBlog);

export default router;
