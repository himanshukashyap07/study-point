import { apiResponse } from "@/lib/apiResponse";
import { apiError } from "@/lib/apiError";
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/DbConnect";
import { Comment } from "@/models/Comment";
import { getServerSession } from "next-auth/next";
import { authOption } from "@/app/api/auth/[...nextauth]/options";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const session = await getServerSession(authOption);
    if (!session || !session.user) {
      return apiError("Unauthorized", 401);
    }

    await dbConnect();
    const comment = await Comment.findById(id);

    if (!comment) {
      return apiError("Comment not found", 404);
    }

    // Only allow the author or an admin to delete the comment
    if (comment.user.toString() !== (session.user as any)._id && session.user.role !== 'admin') {
      return apiError("Forbidden: You cannot delete this comment", 403);
    }

    await comment.deleteOne();

    return apiResponse({ message: "Comment deleted successfully" }, 200);
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
    if (!session || !session.user) {
      return apiError("Unauthorized", 401);
    }

    await dbConnect();
    const comment = await Comment.findById(id);

    if (!comment) {
      return apiError("Comment not found", 404);
    }

    // Only allow the original author to update the comment
    if (comment.user.toString() !== (session.user as any)._id) {
       return apiError("Forbidden: You cannot edit this comment", 403);
    }

    const body = await request.json();
    
    // Allow updating comment text or likes count
    if (body.comment !== undefined) {
      comment.comment = body.comment;
    }
    if (body.likesCount !== undefined) {
      comment.likesCount = body.likesCount;
    }

    const updatedComment = await comment.save();

    return apiResponse({ data: updatedComment, message: "Comment updated successfully" }, 200);
  } catch (error: any) {
    return apiError(error.message, 400);
  }
}
