// File: app/api/auth/password/reset/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/libs/db";
import User from "@/app/models/User";
import { errorHandler } from "@/app/utils/errorHandler";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    // Connect to database
    await dbConnect();

    const { token, password } = await request.json();

    // Validate input
    if (!token || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide token and new password"
        },
        { status: 400 }
      );
    }

    // Hash the token from params
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find user by token and check if token is still valid
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired token"
        },
        { status: 400 }
      );
    }

    // Set new password
    user.password = password;

    // Clear reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    // Save user with new password
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Password updated successfully"
    });
  } catch (error) {
    return errorHandler(error);
  }
}
