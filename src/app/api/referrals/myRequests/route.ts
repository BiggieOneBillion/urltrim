// app/api/referrals/myRequests/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/libs/db";
import { ReferralRequest } from "@/app/models/ReferralRequest";
import { Url } from "@/app/models/Url";
import { getCurrentUser } from "@/app/middleware/auths";

export async function GET(req: NextRequest) {
  await dbConnect();
  
  try {
      // Get current user
    const user = await getCurrentUser(req);
    
    if (!user || !user._id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    // Find requests made by the user
    const requests = await ReferralRequest.find({
      requesterId: user._id
    }).sort({ createdAt: -1 });
    
    // Get URL details for each request
    const enrichedRequests = await Promise.all(
      requests.map(async (req) => {
        const url = await Url.findById(req.urlId);
        return {
          ...req.toObject(),
          url: url ? {
            originalUrl: url.originalUrl,
            shortUrl: url.shortUrl,
            shortId: url.shortId
          } : null
        };
      })
    );
    
    return NextResponse.json({
      success: true,
      requests: enrichedRequests
    });
    
  } catch (error) {
    console.error("Error fetching referral requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch referral requests" },
      { status: 500 }
    );
  }
}
