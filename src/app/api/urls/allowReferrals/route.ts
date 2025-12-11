// app/api/url/allowReferrals/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/libs/db";
import { Url } from "@/app/models/Url";
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
    
    const { urlId, allowReferrals } = await req.json();
    
    // Find the URL and verify ownership
    const url = await Url.findOne({ shortId: urlId });
    
    if (!url) {
      return NextResponse.json({ error: "URL not found" }, { status: 404 });
    }
    
    // Check if user is the owner of the URL
    if (url.userId.toString() !== user._id.toString()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    
    // Update the allowReferrals flag
    url.allowReferrals = allowReferrals;
    await url.save();
    console.log("allowed referrals for this url")
    return NextResponse.json({
      success: true,
      message: allowReferrals ? "Referrals enabled" : "Referrals disabled",
      url
    });
    
  } catch (error) {
    console.error("Error updating referral permission:", error);
    return NextResponse.json(
      { error: "Failed to update referral permission" },
      { status: 500 }
    );
  }
}