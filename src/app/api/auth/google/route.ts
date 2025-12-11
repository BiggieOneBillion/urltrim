// File: app/api/auth/google/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/libs/db";
import User from "@/app/models/User";
import { generateToken } from "@/app/middleware/auths";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

export async function POST(request: Request) {
  try {
    // Connect to database
    await dbConnect();

    const { tokenId } = await request.json();

    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const { email_verified, name, email } = ticket.getPayload() || {};

    // Check if email is verified by Google
    if (!email_verified) {
      return NextResponse.json(
        { success: false, message: "Google account email not verified" },
        { status: 400 }
      );
    }

    // Find or create user
    let user = await User.findOne({ email });

    // If user doesn't exist, create a new one
    if (!user) {
      // Generate a random secure password for the user
      const randomPassword = Math.random().toString(36).slice(-8);

      user = await User.create({
        name,
        email,
        password: randomPassword // We should never need this password
      });
    }

    // Generate JWT token
    const token = await generateToken(user._id);

    // Create response with user data
    const response = NextResponse.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      }
    });

    // Set cookie with token
    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/"
    });

    return response;
  } catch (error) {
    console.error("Google auth error:", error);
    return NextResponse.json(
      { success: false, message: "Authentication failed" },
      { status: 500 }
    );
  }
}
