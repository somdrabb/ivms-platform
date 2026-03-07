// src/models/user.js
import mongoose from 'mongoose';

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    name: { type: String, trim: true },
    passwordHash: { type: String, required: true },
    passwordSalt: { type: String, required: true },
    roles: {
      type: [String],
      default: ['clerk'],
      enum: ['admin', 'manager', 'clerk']
    },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date }
  },
  { timestamps: true, minimize: false }
);

export const User = mongoose.model('User', UserSchema);
