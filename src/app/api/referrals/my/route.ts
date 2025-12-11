// app/api/referrals/my/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/libs/db";
import { Url } from "@/app/models/Url";
import { Visit } from "@/app/models/Url";
import mongoose from "mongoose";
import { getCurrentUser } from "@/app/middleware/auths";
import User from "@/app/models/User"; // Import User model properly

export async function GET(req: NextRequest) {
  await dbConnect();
  
  try {
    const user = await getCurrentUser(req);
    
    if (!user || !user._id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    // Find all original URLs created by the user
    const originalUrls = await Url.find({
      userId: user._id,
      isReferral: false
    });
    
    // Get the IDs of these original URLs
    const originalUrlIds = originalUrls.map(url => url._id);
    
    // Now find all referral URLs that reference these original URLs
    const referralUrls = await Url.find({
      originalUrlId: { $in: originalUrlIds },
      isReferral: true
    }).sort({ createdAt: -1 });
    
    // Get click counts for each referral URL
    const enrichedReferrals = await Promise.all(
      referralUrls.map(async (url) => {
        try {
          // Count clicks from Visit model
          const clickCount = await Visit.countDocuments({ urlId: url._id });
          
          // Get original URL details if this is a referral
          let originalUrlDetails = null;
          if (url.originalUrlId) {
            const originalUrl = await Url.findById(url.originalUrlId);
            if (originalUrl) {
              originalUrlDetails = {
                _id: originalUrl._id,
                shortId: originalUrl.shortId,
                shortUrl: originalUrl.shortUrl,
                originalUrl: originalUrl.originalUrl
              };
            }
          }
          
          // Get referrer user details
          let referrerDetails = null;
          if (url.userId) {
            // Use the User model safely
            try {
              const referrer = await User.findById(url.userId);
              if (referrer) {
                referrerDetails = {
                  _id: referrer._id,
                  name: referrer.name,
                  email: referrer.email
                };
              }
            } catch (userError) {
              console.error("Error fetching user details:", userError);
              // Continue without user details if there's an error
            }
          }
          
          return {
            _id: url._id,
            shortId: url.shortId,
            shortUrl: url.shortUrl,
            originalUrl: url.originalUrl,
            clicks: clickCount,
            createdAt: url.createdAt,
            originalUrlDetails,
            referrerDetails
          };
        } catch (itemError) {
          console.error("Error processing referral item:", itemError);
          // Return a minimal object if there's an error with a specific item
          return {
            _id: url._id,
            shortId: url.shortId,
            shortUrl: url.shortUrl,
            originalUrl: url.originalUrl,
            clicks: 0,
            createdAt: url.createdAt
          };
        }
      })
    );
    
    return NextResponse.json({
      success: true,
      referrals: enrichedReferrals
    });
    
  } catch (error) {
    console.error("Error fetching referral links:", error);
    return NextResponse.json(
      { error: "Failed to fetch referral links" },
      { status: 500 }
    );
  }
}