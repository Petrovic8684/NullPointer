const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required!"],
      unique: true,
      minlength: [3, "Username must be at least 3 characters long!"],
      maxlength: [30, "Username cannot exceed 30 characters!"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required!"],
    },
    image: {
      type: String,
    },
    reputation: {
      type: Number,
      default: 0,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    lastQuestionReward: {
      type: Date,
    },
    cloudinaryImageId: {
      type: String,
    },
    lastImageUpload: {
      type: Date,
    },
  },
  { timestamps: true }
); // Adds createdAt and updatedAt fields.

module.exports = mongoose.model("User", userSchema);
