// app/api/referrals/status/[requestId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/libs/db";
import { Url } from "@/app/models/Url";
import { ReferralRequest } from "@/app/models/ReferralRequest";
import { getCurrentUser } from "@/app/middleware/auths";

import { nanoid } from "nanoid";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { requestId: string } }
) {
  await dbConnect();
  
  try {
     // Check for authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: "Missing or invalid authorization token" }, { status: 401 });
    }
    const user = await getCurrentUser(req);
    
    if (!user || !user._id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    // Log authentication info for debugging
    const { status } = await req.json();
    const { requestId } = await params;
    
    // Find the request
    const request = await ReferralRequest.findById(requestId);
    
    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }
    
    // Check if user is the owner of the URL
    if (request.ownerId.toString() !== user._id.toString()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    
    // Update request status
    request.status = status;
    await request.save();
    
    // If approved, create the referral URL
    if (status === 'approved') {
      const originalUrl = await Url.findById(request.urlId);
      
      if (!originalUrl) {
        return NextResponse.json({ error: "Original URL not found" }, { status: 404 });
      }
      
      // Generate a short ID
      const shortId = request.customAlias || nanoid(8);
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
      const shortUrl = `${baseUrl}/${shortId}`;
      
      // Create the new referral URL
      const referralUrl = await Url.create({
        originalUrl: originalUrl.originalUrl,
        shortId,
        shortUrl,
        isReferral: true,
        referrerId: request.requesterId,
        userId: request.requesterId,
        totalClicks: 0,
         originalUrlId: originalUrl._id // Store reference to the original UR
      });
      
      return NextResponse.json({
        success: true,
        message: "Referral request approved and URL created",
        request,
        referralUrl
      });
    }
    
    return NextResponse.json({
      success: true,
      message: `Referral request ${status}`,
      request
    });
    
  } catch (error) {
    console.error(`Error updating referral request:`, error);
    return NextResponse.json(
      { error: "Failed to update referral request" },
      { status: 500 }
    );
  }
}