import { Schema, model } from "mongoose";

export interface IUser {
  name: string;
  email: string;
  passwordHash: string;
  role: "user" | "resort_manager" | "super_admin";
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["user", "resort_manager", "super_admin"],
      default: "user",
      required: true,
    },
  },
  { timestamps: true },
);

export const User = model<IUser>("User", UserSchema);

export function toUserDTO(u: IUser & { _id: unknown }) {
  return {
    _id: String(u._id),
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt.toISOString(),
  };
}
