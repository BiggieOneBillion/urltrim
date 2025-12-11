// // app/api/[shortId]/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import dbConnect from '@/libs/db';
// import { Url, Visit, Referral } from '@/app/models/Url';
// import { UAParser } from 'ua-parser-js';
// import { getGeoData } from '@/libs/geo';

// export async function GET(
//   req: NextRequest,
//   { params }: { params: { shortId: string } }
// ) {
//   await dbConnect();

//   const { shortId } = params;
//   const referralCode = req.nextUrl.searchParams.get('ref');
//   const userAgent = req.headers.get('user-agent') || '';
//   const ipAddress = req.headers.get('x-forwarded-for') ||
//                     req.headers.get('x-real-ip') || '';

//   try {
//     // Find the URL by shortId
//     const url = await Url.findOne({ shortId });

//     if (!url) {
//       return NextResponse.json({ error: "URL not found" }, { status: 404 });
//     }

//     // Check if URL has expired
//     if (url.expireAt && url.expireAt < new Date()) {
//       return NextResponse.json({ error: "URL has expired" }, { status: 410 });
//     }

//     // Parse user agent for device info
//     const parser = new UAParser(userAgent);
//     const device = parser.getDevice().type || 'unknown';
//     const browser = parser.getBrowser().name || 'unknown';
//     const os = parser.getOS().name || 'unknown';

//     // Get geolocation data from IP
//     const geoData = await getGeoData(Array.isArray(ipAddress) ? ipAddress[0] : ipAddress);

//     // Find referral if code is provided
//     let referralId = null;
//     if (referralCode) {
//       const referral = await Referral.findOne({ code: referralCode });
//       if (referral) {
//         referralId = referral._id;
//       }
//     }

//     // Track the visit
//     await Visit.create({
//       urlId: url._id,
//       referralId,
//       ipAddress: Array.isArray(ipAddress) ? ipAddress[0] : ipAddress,
//       userAgent,
//       device,
//       browser,
//       os,
//       country: geoData?.country,
//       city: geoData?.city,
//       latitude: geoData?.latitude,
//       longitude: geoData?.longitude,
//     });

//     // Return redirect response
//     return NextResponse.redirect(url.originalUrl);

//   } catch (error) {
//     console.error('Error handling redirect:', error);
//     return NextResponse.json({ error: "Failed to process redirect" }, { status: 500 });
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/libs/db";
import { Url, Visit } from "@/app/models/Url";

export async function GET(
  req: NextRequest,
  { params }: { params: { shortId: string } }
) {
  await dbConnect();
  const shortId = await params.shortId;

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
