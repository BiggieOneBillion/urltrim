// models/ReferralRequest.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IReferralRequest extends Document {
  urlId: mongoose.Types.ObjectId;
  requesterId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  status: 'pending' | 'approved' | 'declined';
  customAlias?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReferralRequestSchema = new Schema<IReferralRequest>(
  {
    urlId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Url', 
      required: true 
    },
    requesterId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    ownerId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'declined'], 
      default: 'pending' 
    },
    customAlias: { 
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

export const ReferralRequest = 
  mongoose.models.ReferralRequest || 
  mongoose.model<IReferralRequest>("ReferralRequest", ReferralRequestSchema);