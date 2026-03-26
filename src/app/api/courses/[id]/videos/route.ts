import { apiResponse } from "@/lib/apiResponse";
import { apiError } from "@/lib/apiError";
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/DbConnect";
import { Course } from "@/models/Course";
import { Video } from "@/models/Video";
import { User } from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOption } from "@/app/api/auth/[...nextauth]/options";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    await dbConnect();
    
    const course = await Course.findById(id).populate({ path: 'videoList', model: Video, options: { sort: { order: 1 } } });
    if (!course) {
      return apiError("Course not found", 404);
    }

    const session = await getServerSession(authOption);
    
    let isEnrolled = false;
    let isAdminOrInstructor = false;

    if (session && session.user) {
      if (session.user.role === 'admin' || session.user.role === 'instructor') {
        isAdminOrInstructor = true;
      } else {
        const userDoc = await User.findById((session.user as any)._id);
        if (userDoc && userDoc.enrolledCourses.includes(id)) {
          isEnrolled = true;
        }
      }
    }

    // Map videos based on access
    const videos = course.videoList.map((video: any) => {
      const videoObj = video.toObject ? video.toObject() : video;
      
      // Allow access if admin, instructor, strictly enrolled, or video is Free
      if (isAdminOrInstructor || isEnrolled || video.isFree) {
        return videoObj;
      }
      
      // Metadata only, remove videoUrl and resources for unauthenticated/unenrolled users
      delete videoObj.videoUrl;
      delete videoObj.resources;
      return videoObj;
    });

    return apiResponse({ count: videos.length, data: videos }, 200);
  } catch (error: any) {
    return apiError(error.message, 400);
  }
}
