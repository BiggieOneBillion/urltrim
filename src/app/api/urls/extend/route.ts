// app/api/urls/extend/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/libs/db";
import { Url } from "@/app/models/Url";
import { getCurrentUser } from "@/app/middleware/auths";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const body = await req.json();
    const { urlId, extensionDays = 90 } = body; // Default to 90 days if not specified

    if (!urlId) {
      return NextResponse.json(
        { error: "URL ID is required" },
        { status: 400 }
      );
    }

    // Get current user
    const user = await getCurrentUser(req);

    if (!user || !user._id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Find the URL to update
    const urlToUpdate = await Url.findOne({
      shortId: urlId,
      userId: user._id
    });

    if (!urlToUpdate) {
      return NextResponse.json(
        { error: "URL not found or doesn't belong to this user" },
        { status: 404 }
      );
    }

    // Check if this is a referral URL
    if (urlToUpdate.isReferral && urlToUpdate.originalUrlId) {
      return NextResponse.json(
        { error: "Cannot extend expiration of a referral URL directly. Please extend the original URL." },
        { status: 400 }
      );
    }

    // Start a session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Calculate new expiration date
      const now = new Date();
      const currentExpiry = urlToUpdate.expireAt || now;
      
let newExpiry;
if (extensionDays < 0) {
  // Calculate the reduced date
  const reducedDate = new Date(currentExpiry.getTime() + extensionDays * 24 * 60 * 60 * 1000);
  
  // Ensure the new date is not in the past
  if (reducedDate < now) {
    // If reducing would make it expire, set to now + 1 day as minimum
    newExpiry = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  } else {
    newExpiry = reducedDate;
  }
} else {
  // For positive days (extending), use the original logic
  newExpiry = currentExpiry < now 
    ? new Date(now.getTime() + extensionDays * 24 * 60 * 60 * 1000)
    : new Date(currentExpiry.getTime() + extensionDays * 24 * 60 * 60 * 1000);
}

// Update the expiration date of the parent URL
await Url.findByIdAndUpdate(
  urlToUpdate._id,
  { 
    expireAt: newExpiry,
    isSuspended: false // Reactivate the URL if it was suspended due to expiration
  },
  { session }
);
      
      // Update all child URLs (referrals) with the same expiration date
      await Url.updateMany(
        { originalUrlId: urlToUpdate._id },
        { 
          expireAt: newExpiry,
          isSuspended: false // Reactivate all referral URLs as well
        },
        { session }
      );
      
      // Commit the transaction
      await session.commitTransaction();
      session.endSession();
      
      return NextResponse.json({
        success: true,
        message: `URL expiration extended successfully to ${newExpiry.toISOString()}`,
        url: {
          shortId: urlToUpdate.shortId,
          expireAt: newExpiry
        }
      });
    } catch (error) {
      // If anything fails, abort the transaction
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    console.error("Error extending URL expiration:", error);
    return NextResponse.json(
      { error: "Failed to extend URL expiration" },
      { status: 500 }
    );
  }
}