// /api/urls/sync.js

import { NextRequest, NextResponse } from 'next/server';
import {getCurrentUser} from "@/app/middleware/auths"
import {Url} from "@/app/models/Url"; // Make sure to import your URL model
import dbConnect from "@/libs/db";
import mongoose from 'mongoose';
const { ObjectId } = mongoose.Types;
export async function POST(req: NextRequest) {
 
  try {
    // Verify authentication
    let user = await getCurrentUser(req);
   const userId = typeof user._id === 'string' ? new ObjectId(user._id) : user._id;
    if (!userId) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
     // Parse the request body
    const data = await req.json();
    const { urls } = data;

      if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: 'No URLs provided to sync' },
        { status: 400 }
      );
    }
    await dbConnect();
   // Process each URL - this is pseudocode, adapt to your actual database schema
    const results = await Promise.all(
      urls.map(async (urlData) => {
        // Check if URL with this shortId already exists
          const existingUrl = await Url.findOne({ shortId: urlData.shortId });
          if (existingUrl) {
          // If URL exists but doesn't belong to a user, associate it
         if (!existingUrl.userId) {
            existingUrl.userId = userId;
            return await existingUrl.save();
          }
          // If URL exists and belongs to another user, create a new entry
         else if (existingUrl.userId.toString() !== userId.toString()){
            // You might want to generate a new shortId here
              return await Url.create({
              originalUrl: urlData.originalUrl,
              shortId: urlData.customId || `${urlData.shortId}-${Date.now().toString(36)}`,
              userId: userId,
              expiresAt: urlData.expiresIn 
                ? new Date(Date.now() + urlData.expiresIn * 24 * 60 * 60 * 1000) 
                : null
            });
          }
          // If URL already belongs to this user, do nothing
          return existingUrl;
        } else {
          // If URL doesn't exist, create it
          return await Url.create({
            originalUrl: urlData.originalUrl,
            shortId: urlData.shortId,
            userId: userId,
            expiresAt: urlData.expiresIn 
              ? new Date(Date.now() + urlData.expiresIn * 24 * 60 * 60 * 1000) 
              : null
          });
        }
      })
    );
   
   
   return NextResponse.json({
      success: true,
      message: `Synced ${results.length} URLs to user account`,
      count: results.length
    });
  } catch (error) {
    console.error('Error syncing URLs:', error);
    return NextResponse.json(
      { error: 'Failed to sync URLs with database' },
      { status: 500 }
    );
  }
}