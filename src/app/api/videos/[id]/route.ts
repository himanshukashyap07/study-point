import { apiResponse } from "@/lib/apiResponse";
import { apiError } from "@/lib/apiError";
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/DbConnect";
import { Video } from "@/models/Video";
import { Course } from "@/models/Course";
import { getServerSession } from "next-auth/next";
import { authOption } from "@/app/api/auth/[...nextauth]/options";

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

    const deletedVideo = await Video.findByIdAndDelete(id);

    if (!deletedVideo) {
      return apiError("Video not found", 404);
    }

    // Decrement the automated calculated fields (totalVideo and totalDuration) in Course
    await Course.findByIdAndUpdate(deletedVideo.courseId, {
      $pull: { videoList: deletedVideo._id },
      $inc: { totalVideo: -1, totalDuration: -deletedVideo.duration }
    });

    return apiResponse({ message: "Video deleted successfully" }, 200);
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

    // Fields to update based on plan: title, description, thumbnail, videoUrl, order, duration, isFree
    const allowedFields = ['title', 'description', 'thumbnail', 'videoUrl', 'order', 'duration', 'isFree'];
    const updateData: any = {};
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    let updatedVideo;
    
    // Check if duration changed, because we need to update Course totalDuration if it did.
    // Also push resourceUrl if available.
    if (Object.keys(updateData).length > 0 || body.resourceUrl) {
      const existingVideo = await Video.findById(id);
      if (!existingVideo) {
        return apiError("Video not found", 404);
      }

      let durationDiff = 0;
      if (updateData.duration !== undefined && updateData.duration !== existingVideo.duration) {
        durationDiff = updateData.duration - existingVideo.duration;
      }

      const operations: any = {};
      if (Object.keys(updateData).length > 0) {
        operations.$set = updateData;
      }
      if (body.resourceUrl) {
        operations.$push = { resources: body.resourceUrl };
      }

      updatedVideo = await Video.findByIdAndUpdate(
        id,
        operations,
        { new: true, runValidators: true }
      );

      // Update course total duration if modified
      if (durationDiff !== 0) {
        await Course.findByIdAndUpdate(updatedVideo.courseId, {
          $inc: { totalDuration: durationDiff }
        });
      }
    } else {
      return apiError("No valid fields provided to update", 400);
    }

    return apiResponse({ data: updatedVideo, message: "Video updated successfully" }, 200);
  } catch (error: any) {
    return apiError(error.message, 400);
  }
}
