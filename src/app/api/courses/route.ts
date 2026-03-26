import { apiResponse } from "@/lib/apiResponse";
import { apiError } from "@/lib/apiError";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/DbConnect";
import { Course } from "@/models/Course";

import { getServerSession } from "next-auth/next";
import { authOption } from "@/app/api/auth/[...nextauth]/options";
import { courseSchema } from "@/schemas/adminSchemas";

export async function GET(request: Request) {
  try {
    await dbConnect();
    const courses = await Course.find({}).sort({ createdAt: -1 }).lean();
    return apiResponse({ count: courses.length, data: courses }, 200);
  } catch (error: any) {
    return apiError(error.message, 400);
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOption);
    if (!session || !session.user || (session.user.role !== 'admin' && session.user.role !== 'instructor')) {
      return apiError("Forbidden: Instructor or Admin access required", 403);
    }

    await dbConnect();
    const body = await request.json();
    const validation = courseSchema.safeParse(body);
    
    if (!validation.success) {
      return apiError(`Validation failed: ${validation.error.issues.map((e: any) => e.message).join(', ')}`, 400);
    }

    const course = await Course.create(validation.data);
    return apiResponse({ data: course }, 201);
  } catch (error: any) {
    return apiError(error.message, 400);
  }
}
