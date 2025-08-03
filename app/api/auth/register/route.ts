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
    const { name, email, password } = body;

    // Sanitize input data
    const sanitizedData = sanitizeFormData({ name, email, password });

    // Validate input using the same schema as client-side
    const validation = validateForm(sanitizedData, authValidationSchemas.register);
    if (!validation.isValid) {
      return NextResponse.json(
        createServerValidationResponse(validation.errors),
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email: sanitizedData.email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { 
          success: false, 
          message: "An account with this email already exists",
          errors: { email: "An account with this email already exists" }
        },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(sanitizedData.password, 10);
    if (!hashedPassword) {
      return NextResponse.json(
        { success: false, message: "Failed to hash password." },
        { status: 500 }
      );
    }

    const newUser = await User.create({
      name: sanitizedData.name,
      email: sanitizedData.email.toLowerCase(),
      password: hashedPassword,
    });
    if (!newUser) {
      return NextResponse.json(
        { success: false, message: "Failed to create user." },
        { status: 500 }
      );
    }
    const token = generateToken(newUser._id);
    
    const response = NextResponse.json(
      {
        success: true,
        message: "User registered successfully.",
        user: {
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          createdAt: newUser.createdAt,
        },
      },
      { status: 201 }
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
    console.log("Error in user registration:", error);
    return NextResponse.json(
      { success: false, message: "Failed to register user." },
      { status: 500 }
    );
  }
}
