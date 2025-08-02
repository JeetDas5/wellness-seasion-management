import { connectDB } from "@/lib/db";
import User from "@/models/User";
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
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: "User not found" 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to fetch user" 
    }, { status: 500 });
  }
}