// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
      default: "/default-avatar.png", // مسار افتراضي
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isHR: {
      type: Boolean,
      default: false,
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      unique: true,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
