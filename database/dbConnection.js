import mongoose from "mongoose";
export const dbConnection = () => {
  mongoose
    // console
    // .log(process.env.MONGO_URI)

    .connect(process.env.MONGO_URI_DEV, {
      dbName: "MERN_BLOG_WEB",
    })
    .then(() => {
      console.log("connected to database");
    })
    .catch((err) => {
      console.log(`Error while connection ${err}`);
    });
};
