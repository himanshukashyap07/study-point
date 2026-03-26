import { apiResponse } from "@/lib/apiResponse";
import { apiError } from "@/lib/apiError";
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/DbConnect";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth/next";
import { authOption } from "../../../auth/[...nextauth]/options";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  
  try {
    const session = await getServerSession(authOption);
    if (!session || !session.user) {
      return apiError("Unauthenticated request", 401);
    }

    // Only allow the user to change their own password
    if ((session.user as any)._id !== id) {
      return apiError("Forbidden: You can only change your own password", 403);
    }

    const { oldPassword, newPassword } = await req.json();

    if (!oldPassword || !newPassword) {
      return apiError("Both old and new password are required", 400);
    }

    await dbConnect();
    const userDoc = await User.findById(id);

    if (!userDoc) {
      return apiError("User not found", 404);
    }

    const correctPassword = await bcrypt.compare(oldPassword, userDoc.password);
    if (!correctPassword) {
      return apiError("Incorrect old password", 400);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    userDoc.password = hashedPassword;
    await userDoc.save();

    return apiResponse({ message: "Password updated successfully" }, 200);
  } catch (error: any) {
    return apiError(error.message, 400);
  }
}
