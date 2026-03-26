import { NextRequest } from "next/server";
import { apiResponse } from "@/lib/apiResponse";
import { apiError } from "@/lib/apiError";
import dbConnect from "@/lib/DbConnect";
import { Testimonial } from "@/models/Testimonials";
import { getServerSession } from "next-auth/next";
import { authOption } from "@/app/api/auth/[...nextauth]/options";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const res = await Testimonial.find({}).sort({ createdAt: -1 });
    return apiResponse(res, 200);
  } catch (error: any) {
    return apiError(error.message, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOption);
    if (!session || session.user.role !== "admin") return apiError("Unauthorized", 401);

    await dbConnect();
    const body = await req.json();
    const t = await Testimonial.create(body);
    return apiResponse(t, 201);
  } catch (error: any) {
    return apiError(error.message, 500);
  }
}
