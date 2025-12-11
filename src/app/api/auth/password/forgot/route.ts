// File: app/api/auth/password/forgot/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/libs/db";
import User from "@/app/models/User";
import { errorHandler } from "@/app/utils/errorHandler";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    // Connect to database
    await dbConnect();

    const { email } = await request.json();

    // Validate input
    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide an email address"
        },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "There is no user with that email"
        },
        { status: 404 }
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Set expire (10 minutes)
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    // In a real implementation, you would send an email with the reset token
    // For development purposes, we'll just return the token
    // DO NOT do this in production - send an email instead!

    // Note: In production, you would use a service like SendGrid, Mailgun, etc.
    // const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    // await sendEmail({ ... });

    return NextResponse.json({
      success: true,
      message: "Password reset email sent",
      // Remove this in production:
      data: {
        resetToken
      }
    });
  } catch (error) {
    // If there's an error, clean reset tokens
    const { email } = await request.json();
    if (email) {
      const user = await User.findOne({ email });
      if (user) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
      }
    }

    return errorHandler(error);
  }
}
