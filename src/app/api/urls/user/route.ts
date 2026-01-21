// File: /app/api/urls/user/route.js (or route.ts if using TypeScript)
import { NextResponse, NextRequest } from 'next/server';
import dbConnect from "@/libs/db";
import {getCurrentUser} from "@/app/middleware/auths"
import {Url} from "@/app/models/Url"; // Make sure to import your URL model

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    const userId = user._id
    if (!userId) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Connect to database
     await dbConnect();
    
    // Fetch user's URLs
     const urls = await Url
      .find({ userId: userId })
      .sort({ createdAt: -1 });
    
    // Return the URLs
     return NextResponse.json({ 
      urls: urls.map(url => ({
        ...url.toObject(),  // Use toObject() for proper serialization
        _id: url._id.toString(), 
      })),
      count: urls.length
    });
    
  } catch (error) {
    console.error('Error in /api/urls/user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}