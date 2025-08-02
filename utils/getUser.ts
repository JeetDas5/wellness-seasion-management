import { verifyToken } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function getUser(request: NextRequest) {
  const token = request.headers.get("Authorization")?.split(" ")[1];
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
