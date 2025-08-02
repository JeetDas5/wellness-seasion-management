import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export function generateToken(userId: string): string {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "1h" });
}

export function verifyToken(token: string): { userId: string } | null {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}
