// File: app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { withAuth } from "@/app/middleware/auths";

export const GET = withAuth(async (request: Request, user: any) => {
  try {
    return NextResponse.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching user data" },
      { status: 500 }
    );
  }
});
