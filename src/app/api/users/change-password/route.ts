import { NextRequest } from "next/server";
import { apiResponse } from "@/lib/apiResponse";
import { apiError } from "@/lib/apiError";
import dbConnect from "@/lib/DbConnect";
import { User } from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOption } from "@/app/api/auth/[...nextauth]/options";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOption);
        if (!session || !session.user) {
            return apiError("Unauthorized", 401);
        }

        const { oldPassword, newPassword } = await req.json();
        if (!oldPassword || !newPassword) {
            return apiError("Old password and new password are required", 400);
        }

        await dbConnect();
        const user = await User.findById((session.user as any)._id);
        if (!user) {
            return apiError("User not found", 404);
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return apiError("Incorrect old password", 401);
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        return apiResponse("Password changed successfully", 200);
    } catch (error: any) {
        return apiError(error.message, 500);
    }
}
