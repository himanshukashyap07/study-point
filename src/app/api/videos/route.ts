import { apiResponse } from "@/lib/apiResponse";
import { apiError } from "@/lib/apiError";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/DbConnect";
import { Video } from "@/models/Video";
import { Course } from "@/models/Course";

import { getServerSession } from "next-auth/next";
import { authOption } from "@/app/api/auth/[...nextauth]/options";
import { videoSchema } from "@/schemas/adminSchemas";

export async function GET(request: Request) {
  try {
    await dbConnect();

    // Check if courseId is passed as a query param (e.g., /api/videos?courseId=123)
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    const filter = courseId ? { courseId } : {};

    // Sort videos by numerical order to maintain sequential episodes
    const videos = await Video.find(filter).sort({ order: 1 });
    return apiResponse({ count: videos.length, data: videos }, 200);
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
    const validation = videoSchema.safeParse(body);
    
    if (!validation.success) {
      return apiError(`Validation failed: ${validation.error.issues.map((e: any) => e.message).join(', ')}`, 400);
    }

    const video = await Video.create(validation.data);

    // Intelligently attach the video to the specified Course's videoList directly.
    // Also increment the automated calculated fields (totalVideo and totalDuration)
    await Course.findByIdAndUpdate(video.courseId, {
      $push: { videoList: video._id },
      $inc: { totalVideo: 1, totalDuration: video.duration }
    });

    return apiResponse({ data: video }, 201);
  } catch (error: any) {
    return apiError(error.message, 400);
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOption);
    if (!session || !session.user || (session.user.role !== 'admin' && session.user.role !== 'instructor')) {
      return apiError("Forbidden: Instructor or Admin access required", 403);
    }

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('id');

    if (!videoId) {
      return apiError("Video ID is required", 400);
    }

    const video = await Video.findByIdAndDelete(videoId);
    if (!video) {
      return apiError("Video not found", 404);
    }

    // Also decrement totalVideo and totalDuration from the associated course
    await Course.findByIdAndUpdate(video.courseId, {
      $pull: { videoList: video._id },
      $inc: { totalVideo: -1, totalDuration: -video.duration }
    });

    return apiResponse({ message: "Video deleted successfully" }, 200);
  } catch (error: any) {
    return apiError(error.message, 400);
  }
}
