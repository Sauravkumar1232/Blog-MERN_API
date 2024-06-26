import mongoose from "mongoose";
export const dbConnection = () => {
  mongoose

    .connect(process.env.MONGO_URI_PROD, {
      dbName: "MERN_BLOG_WEB",
    })
    .then(() => {
      console.log("connected to database");
    })
    .catch((err) => {
      console.log(`Error while connection ${err}`);
    });
};
