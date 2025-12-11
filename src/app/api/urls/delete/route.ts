// app/api/urls/delete/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/libs/db";
import { Url, Visit }  from "@/app/models/Url";
import { DeletedUrl } from "@/app/models/DeletedUrl";
import { getCurrentUser } from "@/app/middleware/auths";
import bcrypt from "bcryptjs";
import  User  from "@/app/models/User"; // Import your User model
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const body = await req.json();
    const { urlId, password } = body;

    if (!urlId || !password) {
      return NextResponse.json(
        { error: "URL ID and password are required" },
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


    // Find user to verify password
    const userDoc = await User.findById(user._id).select("+password");

    if (!userDoc) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if password exists in the user document
    if (!userDoc.password) {
      return NextResponse.json(
        { error: "Cannot verify password. Please contact support." },
        { status: 500 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, userDoc.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // Find the URL to delete
    const urlToDelete = await Url.findOne({
      shortId: urlId,
      userId: user._id
    });

    if (!urlToDelete) {
      return NextResponse.json(
        { error: "URL not found or doesn't belong to this user" },
        { status: 404 }
      );
    }
    // Start a session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      // Step 1: Find all child URLs (referrals) of this URL
      const childUrls = await Url.find({
        originalUrlId: urlToDelete._id
      }).session(session);
      
      // Step 2: Archive the parent URL
      await DeletedUrl.create([{
        originalUrl: urlToDelete.originalUrl,
        shortId: urlToDelete.shortUrl,
        shortUrl: urlToDelete.shortUrl,
        userId: urlToDelete.userId,
        clicks: urlToDelete.totalClicks,
        createdAt: urlToDelete.createdAt,
        deletedAt: new Date()
      }], { session });
      
      // Step 3: Archive all child URLs
      if (childUrls.length > 0) {
        const childUrlsToArchive = childUrls.map(url => ({
          originalUrl: url.originalUrl,
          shortId: url.shortId,
          shortUrl: url.shortUrl,
          userId: url.userId,
          clicks: url.totalClicks,
          createdAt: url.createdAt,
          deletedAt: new Date()
        }));
        
        await DeletedUrl.create(childUrlsToArchive, { session, ordered: true });
      }
      
      // Step 4: Delete all visit records associated with child URLs
      for (const childUrl of childUrls) {
        await Visit.deleteMany({ urlId: childUrl._id }).session(session);
      }
      
      // Step 5: Delete all visit records associated with the parent URL
      await Visit.deleteMany({ urlId: urlToDelete._id }).session(session);
      
      // Step 6: Delete all child URLs from the main collection
      await Url.deleteMany({ originalUrlId: urlToDelete._id }).session(session);
      
      // Step 7: Delete the parent URL from the main collection
      await Url.findByIdAndDelete(urlToDelete._id).session(session);
      
      // Commit the transaction
      await session.commitTransaction();
      session.endSession();
      
      return NextResponse.json({
        success: true,
        message: "URL and all associated referral URLs deleted successfully"
      });
    } catch (error) {
      // If anything fails, abort the transaction
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    console.error("Error deleting URL:", error);
    return NextResponse.json(
      { error: "Failed to delete URL" },
      { status: 500 }
    );
  }
}
//     // Create a copy in the DeletedUrl collection
//     await DeletedUrl.create({
//       originalUrl: urlToDelete.originalUrl,
//       shortId: urlToDelete.shortId,
//       shortUrl: urlToDelete.shortUrl,
//       userId: urlToDelete.userId,
//       clicks: urlToDelete.clicks,
//       createdAt: urlToDelete.createdAt,
//       deletedAt: new Date()
//     });

//     // Delete the URL from main collection
//     await Url.findByIdAndDelete(urlToDelete._id);

//     return NextResponse.json({
//       success: true,
//       message: "URL deleted successfully"
//     });
//   } catch (error) {
//     console.error("Error deleting URL:", error);
//     return NextResponse.json(
//       { error: "Failed to delete URL" },
//       { status: 500 }
//     );
//   }
// }
