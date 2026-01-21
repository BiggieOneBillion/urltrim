// app/api/stats/[shortId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/libs/db";
import User from "@/app/models/User"
import { Url, Visit } from "@/app/models/Url";
import mongoose from "mongoose";

export async function GET(
  req: NextRequest,
  { params }: { params: { shortId: string } }
) {
 

  const {shortId} = await params;
 await dbConnect();
  try {
    // Find the URL by shortId
    const url = await Url.findOne({ shortId });

    if (!url) {
      return NextResponse.json({ error: "URL not found" }, { status: 404 });
    }

    // Get all visits for this URL
    const visits = await Visit.find({ urlId: url._id }); //my own visits

const referrals = await Url.find({ 
  isReferral: true,
  originalUrlId: url._id 
}).populate('userId', 'name email').exec();
// Get clicks for each referral
const referralsWithStats = await Promise.all(
  referrals.map(async (ref) => {
    // Find visits for this referral URL
    const refVisits = await Visit.find({ urlId: ref._id });
    
    // Initialize with shortId as fallback
    let referrerName = ref.userId.name;
    
    
    return {
      name: referrerName,
      shortId: ref.shortId,
      shortUrl: ref.shortUrl,
      //clicks: ref.totalClicks,
      clicks:refVisits.length,
      originalUrl: ref.originalUrl,
      createdAt: ref.createdAt
    };
  })
);
// Calculate total referral clicks
const totalReferralClicks = referralsWithStats.reduce((sum, ref) => sum + ref.clicks, 0);
const totalOverallClicks = visits.length + totalReferralClicks;
const referrerMap = new Map<string, number>();
// Process each visit to build the referrer distribution
// for (const referral of referrals) {
  
//   let referrerName= referral.userId.name;
//   // Update the count for this referrer
//   referrerMap.set(referrerName, referral.totalClicks);
// }
for (const referral of referralsWithStats) {
  referrerMap.set(referral.name, referral.clicks);
}
// Calculate referrer distribution (where visits came from)

  const referrersDistribution = Object.fromEntries(referrerMap.entries()); 
    // Calculate unique visitors (based on unique IP addresses)
    const uniqueVisitors = new Set(visits.map(visit => visit.ipAddress)).size;

const uniqueVisitorsByDay = visits.reduce((acc, visit) => {
  const date = visit.timestamp.toISOString().split("T")[0];
  if (!acc[date]) {
    acc[date] = new Set();
  }
  acc[date].add(visit.ipAddress);
  return acc;
}, {} as Record<string, Set<string>>);

// Convert sets to counts
const uniqueVisitorsPerDay = Object.entries(uniqueVisitorsByDay).reduce((acc, [date, visitors]) => {
  acc[date] = (visitors as Set<string>).size;
  return acc;
}, {} as Record<string, number>);

    // Time-based calculations
    const clicksByDay = visits.reduce((acc, visit) => {
      const date = visit.timestamp.toISOString().split("T")[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Find peak day
    const peakDay = Object.entries(clicksByDay).reduce((a, b) => 
      (b[1] as any > (a[1] as number)) ? b : a, ['', 0] as [string, number])[0];

    // Calculate average daily clicks
    const avgDailyClicks = visits.length / Object.keys(clicksByDay).length || 0;

    // Last clicked date
    const lastClicked = visits.length > 0 
      ? visits.reduce((a, b) => a.timestamp > b.timestamp ? a : b).timestamp.toISOString()
      : null;

    // Most clicked metrics
    const mostClickedIp = getMostFrequent(visits.map(v => v.ipAddress));
    const mostClickedDevice = getMostFrequent(visits.map(v => v.device));
    const mostClickedCountry = getMostFrequent(visits.map(v => v.country));
    const mostClickedBrowser = getMostFrequent(visits.map(v => v.browser));
    const mostClickedOs = getMostFrequent(visits.map(v => v.os));
    const mostClickedCity = getMostFrequent(visits.map(v => v.city));

    // Distributions
    const geographicDistribution = getDistribution(visits.map(v => v.country));
    const deviceDistribution = getDistribution(visits.map(v => v.device));
    const browserDistribution = getDistribution(visits.map(v => v.browser));
    const osDistribution = getDistribution(visits.map(v => v.os));
// Continent distribution
    const continentDistribution = getDistribution(visits.map(v => v.continent_name));
 // Country details with percentages
    const countryDetails = Object.entries(geographicDistribution).map(([country, count]) => {
      return {
        country,
        count,
        percentage: ((count / visits.length) * 100).toFixed(1)
      };
    }).sort((a, b) => b.count - a.count);
    // Top N lists
    const topCountries = getTopN(geographicDistribution);
    const topCities = getTopN(getDistribution(visits.map(v => v.city)));
    return NextResponse.json({
      shortId: url.shortId,
      shortUrl: url.shortUrl,
      originalUrl: url.originalUrl,
      createdAt: url.createdAt.toISOString(),
       referrals: referralsWithStats,
      expiresAt: url.expireAt ? url.expireAt.toISOString() : "No Expire",
      isSuspended: url.isSuspended || false,
      isReferral: url.isReferral || false,
      stats: {
        totalClicks: visits.length,
        totalOverallClicks: totalOverallClicks,
         totalReferralClicks: totalReferralClicks,
       // totalReferrerCount: Object.values(referrersDistribution).reduce<number>((a, b) => a + (typeof b === 'number' ? b : 0), 0),
    totalReferrerCount: referralsWithStats.length,
       referrersDistribution: referrersDistribution,
        totalCountries: new Set(visits.map(v => v.country)).size,
        avgDailyClicks,
        peakDay,
        lastClicked,
        mostClickedIp,
        mostClickedDevice,
        mostClickedCountry,
        mostClickedBrowser,
        mostClickedOs,
        mostClickedCity,
      //  totalReferrerCount: 0, // You might want to implement this based on your referral system
        mostClickedReferrer: getMostFrequent(visits.map(v => v.urlId || 'Direct')), // Implement if needed
        geographicDistribution,
         continentDistribution,
        countryDetails,
        deviceDistribution,
        browserDistribution,
        osDistribution,
  
        topReferrers:getTopN(referrersDistribution, 10), // Get top 10 referrers, // Implement if needed
        topCountries,
        topCities,
        uniqueVisitors,
           uniqueVisitorsPerDay,
           clicksByDay
      }
    });
  } catch (error) {
    console.error("Error fetching URL stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch URL statistics" },
      { status: 500 }
    );
  }
}

// Helper function to get most frequent item
function getMostFrequent(arr: (string | undefined)[]): string {
  const filtered = arr.filter(item => item !== undefined) as string[];
  if (filtered.length === 0) return 'unknown';
  
  const frequencyMap = filtered.reduce((acc, item) => {
    acc[item] = (acc[item] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(frequencyMap).reduce((a, b) => 
    b[1] > a[1] ? b : a, ['unknown', 0])[0];
}


// Helper function to get distribution
function getDistribution(arr: (string | undefined)[]): Record<string, number> {
  const filtered = arr.filter(item => item !== undefined) as string[];
  return filtered.reduce((acc, item) => {
    acc[item] = (acc[item] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

// Helper function to get top N items
function getTopN(distribution: Record<string, number>, n: number = 5): any[] {
  return Object.entries(distribution)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([name, count]) => ({ name, count }));
}