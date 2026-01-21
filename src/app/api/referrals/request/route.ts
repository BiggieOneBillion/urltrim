// app/api/referrals/request/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/libs/db";
import { Url } from "@/app/models/Url";
import { ReferralRequest } from "@/app/models/ReferralRequest";
import { getCurrentUser } from "@/app/middleware/auths";

export async function POST(req: NextRequest) {
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
    
    const { shortUrl, customAlias } = await req.json() 
    // Find the URL in the database
 const url = await Url.findOne({ shortUrl });    
    if (!url) {
      return NextResponse.json({ error: "URL not found" }, { status: 404 });
    }
    
    // Check if user already has a pending request for this URL
    const existingRequest = await ReferralRequest.findOne({
      urlId: url._id,
      requesterId: user._id,
      status: 'pending'
    });
    
    if (existingRequest) {
      return NextResponse.json({ 
        error: "You already have a pending request for this URL" 
      }, { status: 400 });
    }
    
    // Create the referral request
    const referralRequest = await ReferralRequest.create({
      urlId: url._id,
      requesterId: user._id,
      ownerId: url.userId,
      customAlias: customAlias || null
    });
    
    return NextResponse.json({ 
      success: true, 
      message: "Referral request submitted successfully",
      request: referralRequest
    }, { status: 201 });
    
  } catch (error) {
    console.error("Error creating referral request:", error);
    return NextResponse.json(
      { error: "Failed to create referral request" },
      { status: 500 }
    );
  }
}