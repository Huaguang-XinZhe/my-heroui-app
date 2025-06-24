import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  console.log("[Auth Health] Health check accessed");

  return NextResponse.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    nextauth_url: process.env.NEXTAUTH_URL,
    path: "/api/auth/health",
  });
}
