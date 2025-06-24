import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  console.log("[Auth Simple Test] Simple auth route test");

  return NextResponse.json({
    message: "Auth routes are working",
    timestamp: new Date().toISOString(),
    path: "/api/auth/simple-test",
    environment: process.env.NODE_ENV,
  });
}
