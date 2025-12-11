import { NextRequest, NextResponse } from "next/server";
import { UAParser } from 'ua-parser-js';
import dotenv from "dotenv"
import dbConnect from "@/libs/db";
import { Url, Visit } from "@/app/models/Url";
dotenv.config()
export async function GET(
  req: NextRequest,
  { params }: { params: { shortId: string } }
) {
  const { shortId } = await params;
  await dbConnect();
   function getUserAgent(request: NextRequest) {
  return request.headers.get("user-agent") || "unknown"
  }
   function parseUserAgent(userAgent: string) {
    const parser = new UAParser(userAgent);
    
    return {
      browser: parser.getBrowser().name ||"unknown",
      os: parser.getOS().name,
      device: parser.getDevice().type || "Desktop"
     
    };
  }

  async function getIpGeolocation(ip: string) {
    const requestOptions = {
      method: "GET",
      redirect: "follow"
    };

    try {
      const response = await fetch(
        `https://api.ipgeolocation.io/ipgeo?apiKey=${process.env.IPGEOLOCATION_API}&ip=${ip}`, 
{
  method: "GET",
  redirect: "follow" as RequestRedirect
}
      );
      
       if (!response.ok) {
      console.log(`Geolocation API failed with status: ${response.status}`);
      return null; // Return null instead of throwing an error
    }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("IP Geolocation Error:", error);
      return null;
    }
  }
 
  function getIpAddress(request: NextRequest) {
    const ip = 
      request.headers.get("x-forwarded-for") || 
      request.headers.get("cf-connecting-ip") || 
      "Unknown IP";
    return ip;
  }

  const clientIp = getIpAddress(req);
  const userAgent = getUserAgent(req)
  const parsedUserAgent = parseUserAgent(userAgent);


  try {
    // Fetch IP geolocation
    const ipGeoData = await getIpGeolocation(clientIp);

    const url = await Url.findOne({ shortId });

    if (!url) {
      return NextResponse.json({ error: "URL not found" }, { status: 404 });
    }
    // Check if the URL is suspended
    if (url.isSuspended) {
      return NextResponse.redirect(new URL(`/suspended?id=${shortId}`, req.url));
    }

     // Check if URL has expired
    if (url.expireAt && new Date(url.expireAt) < new Date()) {
      return NextResponse.redirect(new URL("/expired", req.url));
    }

    // Increment totalClicks
    await Url.findOneAndUpdate(
      { shortId: shortId },
      { $inc: { totalClicks: 1 } },
      { new: true }
    );
    
    // Create a visit record with more detailed information
    const visit = new Visit({
      urlId: url._id,
      timestamp: new Date(),
      device:parsedUserAgent.device,
      ipAddress: clientIp,
      broswer:parsedUserAgent.browser,
      os:parsedUserAgent.os,
      userAgent:userAgent,
      country: ipGeoData?.country_name || "unknown",
      city: ipGeoData?.city || "unknown",
      
      continent_name: ipGeoData?.continent_name || "unknown",
  country_capital: ipGeoData?.country_capital|| "unknown",
  state_prov: ipGeoData?.state_prov || "unknown",
  district: ipGeoData?.district || "unknown",
  zipcode: ipGeoData?.zipcode || "unknown",
  calling_code: ipGeoData?.calling_code || "unknown",
  country_tld: ipGeoData?. country_tld || "unknown",
  language: ipGeoData?.languages || "unknown",
  geoname_id: ipGeoData?.geoname_id || "unknown",
  organization: ipGeoData?.organization || "unknown",
  isp: ipGeoData?.isp || "unknown",
      latitude: ipGeoData?.latitude,
      longitude: ipGeoData?.longitude
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