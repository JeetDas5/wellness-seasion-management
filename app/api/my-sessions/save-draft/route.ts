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
    const { _id, title, tags, json_file_url } = await request.json();

    if (_id) {
      const session = await Session.findOneAndUpdate(
        {
          _id,
          userId: userId,
        },
        {
          title,
          tags,
          json_file_url,
          status: "draft",
          updatedAt: new Date(),
        },
        {
          new: true,
        }
      );
      if (!session) {
        return NextResponse.json(
          { error: "Session not found or unauthorized" },
          { status: 404 }
        );
      }
      return NextResponse.json(session, { status: 200 });
    }
    const newSession = new Session({
      userId,
      title,
      tags,
      json_file_url,
      status: "draft",
    });
    await newSession.save();
    return NextResponse.json(newSession, { status: 201 });
  } catch (error) {
    console.error("Error fetching user sessions:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
