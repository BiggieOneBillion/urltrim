// models/Url.ts

import bcrypt from "bcryptjs";
import crypto from "crypto";
import mongoose, { Schema, Document, Model } from "mongoose";

// URL Document Interface
export interface IUrl extends Document {
  originalUrl: string;
  shortId: string;
  shortUrl:string;
  isReferral: boolean;
  
     allowReferrals: boolean;
  createdAt: Date;
  updatedAt: Date;
  expireAt?: Date;
  referralId?: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId; // Changed from string to ObjectId
  totalClicks: number;
  originalUrlId?: mongoose.Types.ObjectId;
    isSuspended: boolean; // New field for suspension status
}

// URL Schema
const UrlSchema = new Schema<IUrl>(
  {
    originalUrl: { type: String, required: true },
    shortId: { type: String, required: true, unique: true },
    shortUrl:{type: String, required: true, unique:true},
   expireAt: { 
      type: Date, 
      default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // Default 90 days
    },
    userId: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },  // Fixed syntax here
    totalClicks: { type: Number, default: 0 },

  isReferral:{type: Boolean, default:false},
      referralId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null // Stores the user who referred (if applicable)
    },
    
    allowReferrals: {
      type: Boolean,
      default: false
    },
    originalUrlId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Url',
      default: null // Reference to the original URL if this is a referral
    },
    isSuspended: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Create an index on expireAt to automatically delete expired URLs
UrlSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

// Visit Document Interface
export interface IVisit extends Document {
  urlId: mongoose.Types.ObjectId;
  referralId?: mongoose.Types.ObjectId;
  ipAddress?: string;
  userAgent?: string;
  device?: string;
  browser?: string;
  os?: string;
  country?: string;
  continent_name: String;
  country_capital: String;
  state_prov: String;
  district: String;
  zipcode: String;
  calling_code: String;
  country_tld: String;
  language: String;
  geoname_id: String;
  organization: String;
  isp: String;
  city?: string;
  latitude?: number;
  longitude?: number;
  timestamp: Date;
}

// Visit Schema
const VisitSchema = new Schema<IVisit>({
  urlId: { type: Schema.Types.ObjectId, ref: "Url", required: true },
  referralId: { type: Schema.Types.ObjectId, ref: "Referral" },
  ipAddress: String,
  userAgent: String,
  device: String,
  browser: String,
  os: String,
  country: String,
  continent_name: String,
  country_capital: String,
  state_prov: String,
  district: String,
  zipcode: String,
  calling_code: String,
  country_tld: String,
  language: String,
  geoname_id: String,
  organization: String,
  isp: String,
  
  city: String,
  latitude: Number,
  longitude: Number,
  timestamp: { type: Date, default: Date.now },
});

// Referral Document Interface
export interface IReferral extends Document {
  name:string;
  email:string;
  password: string;
  resetPasswordToken?:string;
  resetPasswordExpire?:Date;
  createdAt: Date;
  updatedAt:Date;
  comparePassword(enteredPassword: string): Promise<boolean>;
  getResetPasswordToken(): string;

}

// Referral Schema
const ReferralSchema = new Schema<IReferral>(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      trim: true,
      maxlength: [50, "Name cannot be more than 50 characters"]
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email"
      ],
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false // Don't return password in queries
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
  },
  {
    timestamps: true
  }
);
ReferralSchema.pre("save", async  function(next){
  if(!this.isModified("password")){
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password as string, salt);
  next();
})

ReferralSchema.methods.comparePassword = async function(enteredPassword:string){
  return await bcrypt.compare(enteredPassword, this.password)
}
ReferralSchema.methods.getResetPasswordToken = function() {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set expire (10 minutes)
  this.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);

  return resetToken;
};

// Create models if they don't exist
export const Url =
  mongoose.models.Url || mongoose.model<IUrl>("Url", UrlSchema);
export const Visit =
  mongoose.models.Visit || mongoose.model<IVisit>("Visit", VisitSchema);
export const Referral =
  mongoose.models.Referral ||
  mongoose.model<IReferral>("Referral", ReferralSchema);
