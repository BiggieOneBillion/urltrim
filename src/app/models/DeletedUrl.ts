// app/models/DeletedUrl.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IDeletedUrl extends Document {
  originalUrl: string;
  shortId: string;
  shortUrl: string;
  userId: mongoose.Types.ObjectId;
  clicks: number;
  createdAt: Date;
  deletedAt: Date;
  expireAt: Date;
}

const DeletedUrlSchema: Schema = new Schema({
  originalUrl: {
    type: String,
    required: true
  },
  shortId: {
    type: String,
    required: true,
    unique: true
  },
  shortUrl: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  clicks: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  deletedAt: {
    type: Date,
    default: Date.now
  },
  expireAt: {
    type: Date,
    default: function() {
      // Set expiration to 6 months from deletion date
      const date = new Date();
      date.setMonth(date.getMonth() + 6);
      return date;
    },
    index: { expires: 0 } // This creates a TTL index that will auto-delete documents
  }
});

export const DeletedUrl =
  mongoose.models.DeletedUrl ||
  mongoose.model<IDeletedUrl>("DeletedUrl", DeletedUrlSchema);
