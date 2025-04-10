// This file defines the user model for the application using Mongoose.

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
  });

  module.exports = mongoose.model("User", userSchema);



