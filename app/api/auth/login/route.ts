import { generateToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  await connectDB();
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: "User does not exist." },
        { status: 400 }
      );
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid password." }, { status: 400 });
    }

    return NextResponse.json(
      {
        message: "User logged in successfully.",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          token: generateToken(user._id),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error in user login:", error);
    return NextResponse.json(
      { error: "Failed to login user." },
      { status: 500 }
    );
  }
}
