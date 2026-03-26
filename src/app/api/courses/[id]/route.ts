import { apiResponse } from "@/lib/apiResponse";
import { apiError } from "@/lib/apiError";
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/DbConnect";
import { Course } from "@/models/Course";
import { getServerSession } from "next-auth/next";
import { authOption } from "@/app/api/auth/[...nextauth]/options";
import { User } from "@/models/User";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const session = await getServerSession(authOption);
    if (!session || !session.user || (session.user.role !== 'admin' && session.user.role !== 'instructor')) {
      return apiError("Forbidden: Instructor or Admin access required", 403);
    }

    await dbConnect();
    const deletedCourse = await Course.findByIdAndDelete(id);

    if (!deletedCourse) {
      return apiError("Course not found", 404);
    }

    // Optionally cleanup references from Users (enrolledCourses), etc.
    return apiResponse({ message: "Course deleted successfully" }, 200);
  } catch (error: any) {
    return apiError(error.message, 400);
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const session = await getServerSession(authOption);
    if (!session || !session.user || (session.user.role !== 'admin' && session.user.role !== 'instructor')) {
      return apiError("Forbidden: Instructor or Admin access required", 403);
    }

    await dbConnect();
    const body = await request.json();

    const allowedFields = [
      'title', 'description', 'category', 'board', 'medium', 
      'class', 'subject', 'price', 'isFree', 'thumbnail', 
      'totalVideo', 'totalDuration'
    ];
    
    const updateData: any = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const operations: any = {};
    if (Object.keys(updateData).length > 0) {
      operations.$set = updateData;
    }

    // Push ID's
    if (body.instructorId || body.enrolledStudentId || body.videoId) {
      operations.$push = {};
      
      if (body.instructorId) operations.$push.instructors = body.instructorId;
      if (body.enrolledStudentId) operations.$push.enrolledStudents = body.enrolledStudentId;
      if (body.videoId) operations.$push.videoList = body.videoId;
    }

    if (Object.keys(operations).length === 0) {
      return apiError("No valid fields provided to update", 400);
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      operations,
      { new: true, runValidators: true }
    );

    if (!updatedCourse) {
      return apiError("Course not found", 404);
    }

    return apiResponse({ data: updatedCourse, message: "Course updated successfully" }, 200);
  } catch (error: any) {
    return apiError(error.message, 400);
  }
}
