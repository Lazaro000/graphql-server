import mongoose from "mongoose";

const MONGODB_URI = `mongodb+src://laza:password@cluster...`;

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch(() => {
    console.error("Error connection to MongoDB", error.message);
  });
