import { Schema, model, Types } from "mongoose";

// Masked card metadata only. Never store PANs or CVCs.
const PaymentMethodSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    brand: {
      type: String,
      enum: ["Visa", "Mastercard", "Amex", "Discover", "Card"],
      required: true,
    },
    last4: { type: String, required: true, match: /^\d{4}$/ },
    expMonth: { type: Number, required: true, min: 1, max: 12 },
    expYear: { type: Number, required: true, min: 2024, max: 2099 },
    holder: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const PaymentMethod = model("PaymentMethod", PaymentMethodSchema);
