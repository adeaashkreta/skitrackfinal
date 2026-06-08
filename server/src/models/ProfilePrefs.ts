import { Schema, model, Types } from "mongoose";

const ProfilePrefsSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    phone: { type: String, default: "" },
    dob: { type: String, default: "" },
    street: { type: String, default: "" },
    city: { type: String, default: "" },
    country: { type: String, default: "" },
    language: { type: String, default: "English" },
    currency: { type: String, default: "USD" },
    climates: { type: [String], default: [] },
    roomPref: { type: String, default: "Standard" },
    diets: { type: [String], default: [] },
    accessibility: { type: String, default: "" },
    emailUpdates: { type: Boolean, default: true },
    smsAlerts: { type: Boolean, default: false },
    marketing: { type: Boolean, default: false },
    twoFactor: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const ProfilePrefs = model("ProfilePrefs", ProfilePrefsSchema);
