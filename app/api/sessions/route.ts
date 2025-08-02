import { connectDB } from "@/lib/db";
import Session from "@/models/Session";
import { getUser } from "@/utils/getUser";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  await connectDB();
  const userId = await getUser(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sessions = await Session.find({ status: "published" }).sort({
      createdAt: -1,
    });
    if (!sessions || sessions.length === 0) {
      return NextResponse.json(
        { message: "No published sessions found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      {
        message: "Published sessions retrieved successfully",
        sessions,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
