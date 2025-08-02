import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Create response with success message
    const response = NextResponse.json(
      {
        success: true,
        message: "Logged out successfully",
      },
      { status: 200 }
    );

    // Clear the authentication cookie if it exists
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(0), // Set expiry to past date to delete cookie
      path: '/',
    });

    return response;
  } catch (error) {
    console.error("Error in logout:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to logout" 
      },
      { status: 500 }
    );
  }
}