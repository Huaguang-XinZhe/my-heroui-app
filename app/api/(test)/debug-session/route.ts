import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    return NextResponse.json({
      session,
      timestamp: new Date().toISOString(),
      cookies: request.cookies.getAll(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "获取 session 失败", details: error },
      { status: 500 },
    );
  }
}
