// File: app/utils/authUtils.ts
import { NextResponse } from "next/server";

export const setCookieInResponse = (response: NextResponse, token: string) => {
  response.cookies.set({
    name: "token",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: "/",
  });
  
  return response;
};

export const clearCookieInResponse = (response: NextResponse) => {
  response.cookies.set({
    name: "token",
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict",
    maxAge: -1,
    path: "/",
  });
  
  return response;
};
