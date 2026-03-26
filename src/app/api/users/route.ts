import { apiResponse } from "@/lib/apiResponse";
import { apiError } from "@/lib/apiError";
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/DbConnect";
import { User } from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOption } from "@/app/api/auth/[...nextauth]/options";

export async function GET() {
  try {
    const session = await getServerSession(authOption);
    
    // Only allow admins to view the entire user list
    if (!session || !session.user || session.user.role !== 'admin') {
      return apiError("Forbidden: Admin access required", 403);
    }

    await dbConnect();
    const users = await User.find({}).select("-password");
    return apiResponse({ count: users.length, data: users }, 200);
  } catch (error: any) {
    return apiError(error.message, 400);
  }
}
