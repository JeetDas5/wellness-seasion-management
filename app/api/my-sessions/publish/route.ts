import { connectDB } from "@/lib/db";
import Session from "@/models/Session";
import { getUser } from "@/utils/getUser";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  await connectDB();
  const userId = await getUser(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { _id } = await request.json();
    if (!_id) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }
    const session = await Session.findByIdAndUpdate(
      {
        _id,
      },
      {
        status: "published",
        updatedAt: new Date(),
      },
      {
        new: true,
      }
    );
    if (!session) {
      return NextResponse.json(
        { error: "Failed to publish session" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      {
        message: "Session published successfully",
        session,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error publishing session:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
