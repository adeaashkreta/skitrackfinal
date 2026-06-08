import { Schema, model, Types } from "mongoose";

const BookingSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: "User", required: true, index: true },
    resort: { type: Types.ObjectId, ref: "Resort", required: true, index: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    guests: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
      required: true,
    },
  },
  { timestamps: true },
);

export const Booking = model("Booking", BookingSchema);
