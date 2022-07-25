import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

const { Schema, model } = mongoose;

const schema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    minlength: 5,
  },
  phone: {
    type: String,
    minlength: 5,
  },
  street: {
    type: String,
    required: true,
    minlength: 3,
  },
  city: {
    type: String,
    required: true,
    minlength: 3,
  },
});

schema.plugin(uniqueValidator);

export const Person = model("Person", schema);
