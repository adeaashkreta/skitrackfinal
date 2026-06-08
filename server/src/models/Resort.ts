import { Schema, model, Types } from "mongoose";

const RoomTypeSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    beds: { type: String, required: true },
    sizeM2: Number,
    view: String,
    bathroom: String,
    tv: Boolean,
    image: String,
    capacity: { type: Number, required: true },
    pricePerNight: { type: Number, required: true },
    originalPrice: Number,
    discountPct: Number,
    left: Number,
    perks: [String],
  },
  { _id: false },
);

const ResortSchema = new Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    pricePerDay: { type: Number, required: true },
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced", "Expert"],
      required: true,
    },
    image: { type: String, required: true },
    rating: { type: Number, required: true },
    managerId: { type: Types.ObjectId, ref: "User" },
    country: String,
    tagline: String,
    whyFeatured: String,
    features: [String],
    amenities: [{ type: String, enum: ["wifi", "spa", "bathtub", "hot-tub", "sauna"] }],
    activities: [{ type: String, enum: ["skiing", "snowboarding", "hiking", "cycling"] }],
    maxGuests: Number,
    unavailableRanges: [{ from: String, to: String, _id: false }],
    coordinates: { lat: Number, lon: Number },
    address: String,
    gallery: [String],
    reviewScore: Number,
    reviewCount: Number,
    reviewLabel: String,
    reviewQuote: { text: String, author: String, country: String },
    popularFacilities: [String],
    roomTypes: [RoomTypeSchema],
  },
  { timestamps: true },
);

export const Resort = model("Resort", ResortSchema);

export function toResortDTO(r: any) {
  const o = r.toObject ? r.toObject() : r;
  return {
    ...o,
    _id: String(o._id),
    managerId: o.managerId ? String(o.managerId) : undefined,
  };
}
