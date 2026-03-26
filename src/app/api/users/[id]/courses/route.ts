import { apiResponse } from "@/lib/apiResponse";
import { apiError } from "@/lib/apiError";
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/DbConnect";
import { User } from "@/models/User";
import { Course } from "@/models/Course";
import { getServerSession } from "next-auth/next";
import { authOption } from "@/app/api/auth/[...nextauth]/options";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const session = await getServerSession(authOption);
    if (!session || !session.user) {
      return apiError("Unauthorized", 401);
    }
    
    // Allow user to view their own courses, or admin to view any
    if ((session.user as any)._id !== id && session.user.role !== 'admin') {
      return apiError("Forbidden", 403);
    }

    await dbConnect();
    const user = await (User as any).findById(id).populate({ path: 'enrolledCourses', model: Course });
    if (!user) {
      return apiError("User not found", 404);
    }

    return apiResponse({ count: user.enrolledCourses.length, data: user.enrolledCourses }, 200);
  } catch (error: any) {
    return apiError(error.message, 400);
  }
}
