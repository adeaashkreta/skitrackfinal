import { Schema, model, Types } from "mongoose";

const FavoriteSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    resortId: { type: Types.ObjectId, ref: "Resort", required: true, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);
FavoriteSchema.index({ userId: 1, resortId: 1 }, { unique: true });

export const Favorite = model("Favorite", FavoriteSchema);
