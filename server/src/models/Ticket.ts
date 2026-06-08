import { Schema, model, Types } from "mongoose";

const MessageSchema = new Schema(
  {
    author: { type: String, required: true },
    authorRole: {
      type: String,
      enum: ["user", "resort_manager", "super_admin"],
      required: true,
    },
    body: { type: String, required: true },
    createdAt: { type: String, required: true },
  },
  { _id: false },
);

const TicketSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    userName: { type: String, required: true },
    resortId: { type: Types.ObjectId, ref: "Resort", index: true },
    resortName: String,
    subject: { type: String, required: true },
    status: {
      type: String,
      enum: ["open", "pending", "closed"],
      default: "open",
      required: true,
    },
    messages: { type: [MessageSchema], default: [] },
  },
  { timestamps: true },
);

export const Ticket = model("Ticket", TicketSchema);

export function toTicketDTO(t: any) {
  const o = t.toObject ? t.toObject() : t;
  return {
    _id: String(o._id),
    userId: String(o.userId),
    userName: o.userName,
    resortId: o.resortId ? String(o.resortId) : undefined,
    resortName: o.resortName,
    subject: o.subject,
    status: o.status,
    messages: o.messages,
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
  };
}
