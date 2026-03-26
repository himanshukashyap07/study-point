import { apiResponse } from "@/lib/apiResponse";
import { apiError } from "@/lib/apiError";
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/DbConnect";
import { User } from "@/models/User";
import { Course } from "@/models/Course";
import { Payment } from "@/models/Payment";
import { getServerSession } from "next-auth/next";
import { authOption } from "../../auth/[...nextauth]/options";

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
    
    // Only allow the user to fetch their own profile, or an admin to fetch any profile
    if ((session.user as any)._id !== id && session.user.role !== 'admin') {
      return apiError("Forbidden", 403);
    }

    await dbConnect();
    const user = await (User as any).findById(id)
      .select("-password")
      .populate({ path: 'enrolledCourses', model: Course })
      .populate({ path: 'payments', model: Payment });

    if (!user) {
      return apiError("User not found", 404);
    }

    return apiResponse({ data: user }, 200);
  } catch (error: any) {
    return apiError(error.message, 400);
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const session = await getServerSession(authOption);
    if (!session || !session.user || session.user.role !== 'admin') {
      return apiError("Forbidden: Admin access required", 403);
    }

    await dbConnect();
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return apiError("User not found", 404);
    }

    return apiResponse({ message: "User deleted successfully" }, 200);
  } catch (error: any) {
    return apiError(error.message, 500);
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const session = await getServerSession(authOption);
    if (!session || !session.user || session.user.role !== 'admin') {
      return apiError("Forbidden: Admin access required", 403);
    }

    await dbConnect();
    const body = await request.json();
    
    // Selective assignment of fields based on user feedback
    const { isBlock, isVerified } = body;
    const updateData: any = {};
    if (isBlock !== undefined) updateData.isBlock = isBlock;
    if (isVerified !== undefined) updateData.isVerified = isVerified;

    if (Object.keys(updateData).length === 0) {
       return apiError("No valid fields provided to update", 400);
    }

    const updatedUser = await User.findByIdAndUpdate(
      id, 
      { $set: updateData }, 
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return apiError("User not found", 404);
    }

    return apiResponse({ message: "User updated successfully", data: updatedUser }, 200);
  } catch (error: any) {
    return apiError(error.message, 400);
  }
}