import { verifyToken } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function getUser(request: NextRequest) {
  // Try to get token from Authorization header first
  let token = request.headers.get("Authorization")?.split(" ")[1];
  
  // If no Authorization header, try to get token from cookies
  if (!token) {
    token = request.cookies.get("token")?.value;
  }
  
  if (!token) {
    return null;
  }
  
  const tokenValidation = await verifyToken(token);
  if (!tokenValidation) {
    return null;
  }
  
  const userId = tokenValidation.userId;
  if (!userId) {
    return null;
  }
  
  return userId as string;
}
