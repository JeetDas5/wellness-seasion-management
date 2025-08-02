import { connectDB } from "@/lib/db";
import Session from "@/models/Session";
import { getUser } from "@/utils/getUser";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

export async function PUT(
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
    const { title, tags, json_file_url, status } = body;

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
        message: "Forbidden: You can only update your own sessions"
      }, { status: 403 });
    }

    // Validate fields if provided
    const updateData: Partial<{
      title: string;
      tags: string[];
      json_file_url: string;
      status: 'draft' | 'published';
    }> = {};
    
    if (title !== undefined) {
      if (!title || !title.trim()) {
        return NextResponse.json({
          success: false,
          message: "Title is required",
          errors: { title: "Title is required" }
        }, { status: 400 });
      }
      updateData.title = title.trim();
    }

    if (tags !== undefined) {
      updateData.tags = Array.isArray(tags) ? tags.filter(tag => tag.trim()) : [];
    }

    if (json_file_url !== undefined) {
      if (json_file_url && json_file_url.trim()) {
        try {
          new URL(json_file_url);
          updateData.json_file_url = json_file_url.trim();
        } catch {
          return NextResponse.json({
            success: false,
            message: "Invalid JSON file URL",
            errors: { json_file_url: "Please provide a valid URL" }
          }, { status: 400 });
        }
      } else {
        updateData.json_file_url = '';
      }
    }

    if (status !== undefined) {
      if (!['draft', 'published'].includes(status)) {
        return NextResponse.json({
          success: false,
          message: "Invalid status",
          errors: { status: "Status must be either 'draft' or 'published'" }
        }, { status: 400 });
      }
      updateData.status = status;
    }

    // Update the session
    const updatedSession = await Session.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('userId', 'name email createdAt');

    return NextResponse.json({
      success: true,
      session: updatedSession,
      message: "Session updated successfully"
    }, { status: 200 });

  } catch (error) {
    console.error("Error updating session:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to update session"
    }, { status: 500 });
  }
}