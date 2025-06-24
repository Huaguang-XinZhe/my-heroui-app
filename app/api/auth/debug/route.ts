import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  console.log("[Auth Debug] Environment check:");

  const debug = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    variables: {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || "NOT_SET",
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "SET" : "NOT_SET",
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? "SET" : "NOT_SET",
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET
        ? "SET"
        : "NOT_SET",
      LINUXDO_CLIENT_ID: process.env.LINUXDO_CLIENT_ID ? "SET" : "NOT_SET",
      LINUXDO_CLIENT_SECRET: process.env.LINUXDO_CLIENT_SECRET
        ? "SET"
        : "NOT_SET",
    },
    url: {
      host: request.headers.get("host"),
      origin: request.nextUrl.origin,
      protocol: request.nextUrl.protocol,
    },
  };

  console.log("[Auth Debug]", JSON.stringify(debug, null, 2));

  return NextResponse.json(debug);
}
