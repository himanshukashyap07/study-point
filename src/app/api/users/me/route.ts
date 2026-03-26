import { apiResponse } from "@/lib/apiResponse";
import { apiError } from "@/lib/apiError";
import { getServerSession } from "next-auth/next";
import { authOption } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/DbConnect";
import { User } from "@/models/User";
import { Course } from "@/models/Course";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOption);
    if (!session || !session.user || !session.user.email) {
      return apiError("Unauthorized", 401);
    }
    await dbConnect();
    // Return all info for profile page
    const user = await User.findOne({ email: session.user.email })
       .populate({ path: 'enrolledCourses', model: Course })
       .select("-password");
    if (!user) {
      return apiError("User not found", 404);
    }
    return apiResponse(user, 200);
  } catch (error: any) {
    return apiError(error.message, 500);
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOption);
    if (!session || !session.user || !session.user.email) {
      return apiError("Unauthorized", 401);
    }
    await dbConnect();
    
    const body = await req.json();
    const { username, avatar } = body;

    const user = await User.findOneAndUpdate(
       { email: session.user.email },
       { username, avatar },
       { new: true }
    ).select("-password");

    if (!user) {
      return apiError("User not found", 404);
    }
    return apiResponse(user, 200);
  } catch (error: any) {
    return apiError(error.message, 500);
  }
}
