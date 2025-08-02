import { connectDB } from "@/lib/db";
import Session from "@/models/Session";
import { getUser } from "@/utils/getUser";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const userId = await getUser(request);
  if (!userId) {
    return NextResponse.json({
      success: false,
      message: "Unauthorized"
    }, { status: 401 });
  }

  try {
    const { id } = await params;
    
    // Validate session ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({
        success: false,
        message: "Invalid session ID"
      }, { status: 400 });
    }

    const body = await request.json();
    const { title, tags, json_file_url } = body;

    // Find the session and verify ownership
    const session = await Session.findById(id);
    if (!session) {
      return NextResponse.json({
        success: false,
        message: "Session not found"
      }, { status: 404 });
    }

    if (session.userId.toString() !== userId) {
      return NextResponse.json({
        success: false,
        message: "Forbidden: You can only auto-save your own sessions"
      }, { status: 403 });
    }

    // Prepare update data for auto-save
    const updateData: Partial<{
      title: string;
      tags: string[];
      json_file_url: string;
    }> = {};
    
    if (title !== undefined) {
      updateData.title = title.trim() || session.title;
    }

    if (tags !== undefined) {
      updateData.tags = Array.isArray(tags) ? tags.filter(tag => tag.trim()) : session.tags;
    }

    if (json_file_url !== undefined) {
      // For auto-save, we're more lenient with URL validation
      // We'll save whatever is provided and let the user fix it later
      updateData.json_file_url = json_file_url?.trim() || '';
    }

    // Auto-save should not change the status - keep existing status
    // This ensures drafts remain drafts and published remain published

    // Update the session
    const updatedSession = await Session.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: false } // Skip validation for auto-save
    );

    return NextResponse.json({
      success: true,
      session: updatedSession,
      message: "Session auto-saved successfully",
      lastSaved: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error("Error auto-saving session:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to auto-save session"
    }, { status: 500 });
  }
}