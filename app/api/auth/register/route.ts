import { generateToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  await connectDB();
  try {
    const { name, email, password } = await request.json();
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 }
      );
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    if (!hashedPassword) {
      return NextResponse.json(
        { error: "Failed to hash password." },
        { status: 500 }
      );
    }

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });
    if (!newUser) {
      return NextResponse.json(
        { error: "Failed to create user." },
        { status: 500 }
      );
    }
    return NextResponse.json(
      {
        message: "User registered successfully.",
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          createdAt: newUser.createdAt,
          token: generateToken(newUser._id),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.log("Error in user registration:", error);
    return NextResponse.json(
      { error: "Failed to register user." },
      { status: 500 }
    );
  }
}
