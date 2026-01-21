import { jwtVerify } from "jose";

import { SignJWT } from "jose";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "@/libs/db";
import User from "@/app/models/User";

// Generate JWT token (use with Route Handlers)
export const generateToken = async (id: string) => {
  const secret = new TextEncoder().encode(
    process.env.JWT_SECRET || "your_jwt_secret"
  );

  const token = await new SignJWT({ id })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("3d")
    .sign(secret);

  return token;
};


// For backward compatibility if needed
export const generateTokenSync = (id: string) => {
  // Import here to avoid bundling with Edge code
  const jwt = require("jsonwebtoken");
  return jwt.sign({ id }, process.env.JWT_SECRET || "your_jwt_secret", {
    expiresIn: "30d"
  });
};
async function verifyToken(token: string) {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your_jwt_secret");
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    return null;
  }
}

// Helper function to get current user in Route Handlers
export async function getCurrentUser(request: Request) {
  try {
        const authHeader = request.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

    const token = authHeader.split(" ")[1];
        const decoded = await verifyToken(token);
        if (!decoded || !decoded.id) return null;
        // Convert the id to a string to ensure it's a valid ObjectId
        const userId = decoded.id
       
        
        // Connect to database
        await dbConnect();

        // Get user data
        const user = await User.findById(userId).select("-password");
        return user;
      } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
}

// Helper for protected route handlers
export function withAuth(
  handler: (request: Request, user: any) => Promise<Response>
) {
  return async (request: Request) => {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Not authorized" },
        { status: 401 }
      );
    }

    return handler(request, user);
  };
}
