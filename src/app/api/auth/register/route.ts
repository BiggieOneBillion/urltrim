// File: app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/libs/db";
import User from "@/app/models/User";
import { generateToken } from "@/app/middleware/auths";

export async function POST(request: Request) {
  try {
    // Connect to database
    await dbConnect();

    const { name, email, password } = await request.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Please provide all required fields" },
        { status: 400 }
      );
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return NextResponse.json(
        { success: false, message: "User already exists" },
        { status: 400 }
      );
    }

    // Create user
    const user = new User({
      name,
      email,
      password
    });
    await user.save();
    // Generate JWT token
    const token = await generateToken(user._id.toString());

    // Create response with user data
    const response = NextResponse.json(
      {
        success: true,
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email
        }
      },
      { status: 201 }
    );

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
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, message: "Error registering user" },
      { status: 500 }
    );
  }
}
