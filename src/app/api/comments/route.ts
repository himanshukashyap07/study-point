import { apiResponse } from "@/lib/apiResponse";
import { apiError } from "@/lib/apiError";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/DbConnect";
import { Comment } from "@/models/Comment";
import { User } from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOption } from "@/app/api/auth/[...nextauth]/options";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');

    if (!videoId) {
      return apiError("videoId parameter is required", 400);
    }

    await dbConnect();
    
    // Fetch comments and populate the user details (username, avatar)
    const comments = await Comment.find({ video: videoId })
      .populate({ path: 'user', model: User, select: 'username avatar' })
      .sort({ createdAt: -1 });

    return apiResponse({ count: comments.length, data: comments }, 200);
  } catch (error: any) {
    return apiError(error.message, 400);
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOption);
    if (!session || !session.user) {
      return apiError("Unauthorized", 401);
    }

    await dbConnect();
    const body = await request.json();

    // Ensure the user ID is correctly attached to the comment from the session
    body.user = (session.user as any)._id;

    if (!body.comment || !body.video) {
       return apiError("Comment text and video ID are required", 400);
    }

    const comment = await Comment.create(body);

    return apiResponse({ data: comment }, 201);
  } catch (error: any) {
    return apiError(error.message, 400);
  }
}
