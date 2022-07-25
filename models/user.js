import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

const { Schema, model } = mongoose;

const schema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
  },
  friends: [
    {
      ref: "Person",
      type: Schema.Types.ObjectId,
    },
  ],
});

schema.plugin(uniqueValidator);

export const User = model("User", schema);
