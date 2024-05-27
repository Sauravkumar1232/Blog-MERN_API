import app from "./app.js";
import cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLIENT_NAME,
  api_key: process.env.CLOUDINARY_CLIENT_API,
  api_secret: process.env.CLOUDINARY_CLIENT_SECRET,
});
const PORT = 3000;
app.listen(process.env.PORT || 6010, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
