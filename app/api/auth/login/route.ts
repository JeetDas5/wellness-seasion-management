import { generateToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { authValidationSchemas, validateForm, sanitizeFormData, createServerValidationResponse } from "@/utils/validation";

export async function POST(request: NextRequest) {
  await connectDB();
  try {
    const body = await request.json();
    const { email, password } = body;

    // Sanitize input data
    const sanitizedData = sanitizeFormData({ email, password });

    // Validate input using the same schema as client-side
    const validation = validateForm(sanitizedData, authValidationSchemas.login);
    if (!validation.isValid) {
      return NextResponse.json(
        createServerValidationResponse(validation.errors),
        { status: 400 }
      );
    }
    const user = await User.findOne({ email: sanitizedData.email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          message: "No account found with this email address",
          errors: { email: "No account found with this email address" }
        },
        { status: 400 }
      );
    }
    const isPasswordValid = await bcrypt.compare(sanitizedData.password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ 
        success: false, 
        message: "Incorrect password",
        errors: { password: "Incorrect password" }
      }, { status: 400 });
    }

    const token = generateToken(user._id);
    
    const response = NextResponse.json(
      {
        success: true,
        message: "User logged in successfully.",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
      },
      { status: 200 }
    );

    // Set the token as an HTTP-only cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60, // 1 hour
      path: "/",
    });

    return response;
  } catch (error) {
    console.log("Error in user login:", error);
    return NextResponse.json(
      { success: false, message: "Failed to login user." },
      { status: 500 }
    );
  }
}
