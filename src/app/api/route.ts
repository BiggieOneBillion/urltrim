import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/libs/db";
import { Url, Visit } from "@/app/models/Url";

export async function GET(
  req: NextRequest,
  { params }: { params: { shortId: string } }
) {
  await dbConnect();
  const shortId =  params.shortId;

  try {
    const url = await Url.findOne({ shortId });

    if (!url) {
      return NextResponse.json({ error: "URL not found" }, { status: 404 });
    }

    // Create a visit record
    const visit = new Visit({
      urlId: url._id,
      timestamp: new Date(),
      device: req.headers.get("user-agent") || "unknown",
      country: req.headers.get("x-forwarded-for") || "unknown"
    });
    await visit.save();

    // Redirect to the original URL
    return NextResponse.redirect(url.originalUrl);
  } catch (error) {
    console.error("Error handling short URL:", error);
    return NextResponse.json(
      { error: "Failed to process URL" },
      { status: 500 }
    );
  }
}
