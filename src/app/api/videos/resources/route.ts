import { apiResponse } from "@/lib/apiResponse";
import { apiError } from "@/lib/apiError";
import dbConnect from "@/lib/DbConnect";
import { Video } from "@/models/Video";
import { getServerSession } from "next-auth/next";
import { authOption } from "@/app/api/auth/[...nextauth]/options";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOption);
    if (!session || !session.user || (session.user.role !== 'admin' && session.user.role !== 'instructor')) {
      return apiError("Forbidden: Instructor or Admin access required", 403);
    }

    await dbConnect();
    const { videoId, resource } = await request.json();

    if (!videoId || !resource) {
      return apiError("videoId and resource are required", 400);
    }

    const video = await Video.findByIdAndUpdate(
      videoId,
      { $push: { resources: resource } },
      { new: true }
    );

    if (!video) {
      return apiError("Video not found", 404);
    }

    return apiResponse({ message: "Resource added successfully", data: video }, 200);
  } catch (error: any) {
    return apiError(error.message, 400);
  }
}
