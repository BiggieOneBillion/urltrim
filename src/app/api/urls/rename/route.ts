// app/api/urls/rename/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/libs/db";
import { Url } from "@/app/models/Url";
import { getCurrentUser } from "@/app/middleware/auths";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const body = await req.json();
    const { urlId, newShortId } = body;

    if (!urlId || !newShortId) {
      return NextResponse.json(
        { error: "URL ID and new Short ID are required" },
        { status: 400 }
      );
    }

    // Validate new short ID format
    const validIdPattern = /^[a-zA-Z0-9-_]+$/;
    if (!validIdPattern.test(newShortId)) {
      return NextResponse.json(
        { error: "Custom URL can only contain letters, numbers, hyphens, and underscores" },
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

    // Check if the new short ID is already in use
    const existingUrl = await Url.findOne({ shortId: newShortId });
    if (existingUrl) {
      return NextResponse.json(
        { error: "This custom URL is already in use. Please try another one." },
        { status: 409 }
      );
    }

    // Find the URL to rename and verify ownership
    const urlToRename = await Url.findOne({ 
      shortId: urlId,
      userId: user._id 
    });

    if (!urlToRename) {
      return NextResponse.json(
        { error: "URL not found or doesn't belong to this user" },
        { status: 404 }
      );
    }

    // Update the URL with the new shortId
      const baseUrl = new URL(urlToRename.shortUrl).origin;
      console.log(baseUrl)
    const newShortUrl = `${baseUrl}/${newShortId}`;
    
    await Url.findByIdAndUpdate(urlToRename._id, {
      shortId: newShortId,
      shortUrl: newShortUrl
    });

    return NextResponse.json({
      success: true,
      message: "URL renamed successfully",
      newShortUrl
    });
    
  } catch (error) {
    console.error("Error renaming URL:", error);
    return NextResponse.json(
      { error: "Failed to rename URL" },
      { status: 500 }
    );
  }
}