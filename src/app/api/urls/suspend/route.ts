// app/api/urls/suspend/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/libs/db";
import { Url } from "@/app/models/Url";
import { getCurrentUser } from "@/app/middleware/auths";
import bcrypt from "bcryptjs";
import User from "@/app/models/User";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
    await dbConnect();

    try {
        const body = await req.json();
        const { urlId, password, action } = body;

        if (!urlId || !password || !action) {
            return NextResponse.json(
                { error: "URL ID, password and action (suspend/unsuspend) are required" },
                { status: 400 }
            );
        }

        if (action !== 'suspend' && action !== 'unsuspend') {
            return NextResponse.json(
                { error: "Action must be either 'suspend' or 'unsuspend'" },
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

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, userDoc.password);
        if (!isPasswordValid) {
            return NextResponse.json({ error: "Invalid password" }, { status: 401 });
        }

        // Find the URL to update
        const urlToUpdate = await Url.findOne({
            shortId: urlId,
            userId: user._id
        });

        if (!urlToUpdate) {
            return NextResponse.json(
                { error: "URL not found or doesn't belong to this user" },
                { status: 404 }
            );
        }
// Check if this is a referral URL and the user is not the original owner
if (urlToUpdate.isReferral && urlToUpdate.originalUrlId) {
    // Find the original URL
    const originalUrl = await Url.findById(urlToUpdate.originalUrlId);
    
    // Check if the current user is not the owner of the original URL
    if (!originalUrl || !originalUrl.userId.equals(user._id)) {
        return NextResponse.json(
            { error: "Only the original URL owner can suspend or unsuspend this URL" },
            { status: 403 }
        );
    }
}
        // Start a session for transaction
        const session = await mongoose.startSession();
        session.startTransaction();
    
        try {
            // Update the suspension status of the parent URL
            const isSuspended = action === 'suspend';
            await Url.findByIdAndUpdate(
                urlToUpdate._id,
                { isSuspended },
                { session }
            );
      
            // Update all child URLs (referrals) with the same suspension status
            await Url.updateMany(
                { originalUrlId: urlToUpdate._id },
                { isSuspended },
                { session }
            );
      
            // Commit the transaction
            await session.commitTransaction();
            session.endSession();
      
            return NextResponse.json({
                success: true,
                message: `URL and all associated referral URLs ${isSuspended ? 'suspended' : 'unsuspended'} successfully`,
                url: {
        shortId: urlToUpdate.shortId,
        isSuspended: isSuspended
    }
            });
        } catch (error) {
            // If anything fails, abort the transaction
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    } catch (error) {
        // Get the action from the request body safely
        let action = "update";
        try {
            const body = await req.json();
            action = body?.action || "update";
        } catch {
            // If we can't parse the body again, use a default action name
        }
  
        console.error(`Error ${action}ing URL:`, error);
        return NextResponse.json(
            { error: `Failed to ${action} URL` },
            { status: 500 }
        );
    }
}