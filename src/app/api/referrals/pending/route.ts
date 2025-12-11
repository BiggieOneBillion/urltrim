// app/api/referrals/pending/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/libs/db";
import { ReferralRequest } from "@/app/models/ReferralRequest";
import { Url} from "@/app/models/Url";
import  User  from "@/app/models/User";
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
    
    // Find pending requests for URLs owned by the user
    const pendingRequests = await ReferralRequest.find({
      ownerId: user._id,
      status: 'pending'
    }).sort({ createdAt: -1 });
    
    // Get URL and requester details for each request
    const enrichedRequests = await Promise.all(
      pendingRequests.map(async (req) => {
        const [url, requester] = await Promise.all([
          Url.findById(req.urlId),
          // You'll need to import your User model to use this
          User.findById(req.requesterId)
        ]);
        
        return {
          ...req.toObject(),
          url: url ? {
            originalUrl: url.originalUrl,
            shortUrl: url.shortUrl,
            shortId: url.shortId
          } : null,
          requester: requester ? {
            name: requester.name,
            email: requester.email
          } : null
        };
      })
    );
    
    return NextResponse.json({
      success: true,
      requests: enrichedRequests
    });
    
  } catch (error) {
    console.error("Error fetching pending referral requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch pending referral requests" },
      { status: 500 }
    );
  }
}