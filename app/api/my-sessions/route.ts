import { connectDB } from "@/lib/db";
import Session from "@/models/Session";
import { getUser } from "@/utils/getUser";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  await connectDB();
  const userId = await getUser(request);
  if (!userId) {
    return NextResponse.json({ 
      success: false, 
      message: "Unauthorized" 
    }, { status: 401 });
  }

  try {
    const sessions = await Session.find({ userId }).sort({ updatedAt: -1 });
    
    return NextResponse.json({
      success: true,
      sessions,
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user sessions:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch user sessions"
    }, { status: 500 });
  }
}
