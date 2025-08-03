import { connectDB } from "@/lib/db";
import Session from "@/models/Session";
import { getUser } from "@/utils/getUser";
import { NextRequest, NextResponse } from "next/server";
import { sessionValidationSchema, validateForm, sanitizeFormData, createServerValidationResponse } from "@/utils/validation";

export async function GET(request: NextRequest) {
  await connectDB();
  const userId = await getUser(request);
  if (!userId) {
    return NextResponse.json({ 
      success: false,
      message: "Authentication required",
      code: "UNAUTHORIZED"
    }, { status: 401 });
  }

  try {
    const sessions = await Session.find({ status: "published" })
      .populate('userId', 'name email createdAt')
      .sort({ createdAt: -1 });
    
    return NextResponse.json(
      {
        success: true,
        sessions: sessions || [],
        message: sessions.length === 0 ? "No published sessions found" : undefined
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Unable to fetch sessions. Please try again later.",
      code: "FETCH_SESSIONS_ERROR"
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  await connectDB();
  const userId = await getUser(request);
  if (!userId) {
    return NextResponse.json({ 
      success: false, 
      message: "Unauthorized" 
    }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, tags, json_file_url, status } = body;

    // Sanitize input data
    const sanitizedData = sanitizeFormData({ 
      title, 
      tags: Array.isArray(tags) ? tags : [], 
      json_file_url: json_file_url || '' 
    });

    // Validate input using the same schema as client-side
    const validation = validateForm(sanitizedData, sessionValidationSchema);
    if (!validation.isValid) {
      return NextResponse.json(
        createServerValidationResponse(validation.errors),
        { status: 400 }
      );
    }

    // Validate status
    if (status && !['draft', 'published'].includes(status)) {
      return NextResponse.json({
        success: false,
        message: "Invalid status",
        errors: { status: "Status must be either 'draft' or 'published'" }
      }, { status: 400 });
    }

    const session = new Session({
      userId,
      title: sanitizedData.title,
      tags: sanitizedData.tags.filter(tag => tag.trim()),
      json_file_url: sanitizedData.json_file_url,
      status: status || 'draft'
    });

    await session.save();
    await session.populate('userId', 'name email createdAt');

    return NextResponse.json({
      success: true,
      session,
      message: "Session created successfully"
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to create session"
    }, { status: 500 });
  }
}
