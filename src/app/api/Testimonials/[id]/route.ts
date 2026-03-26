import { NextRequest } from "next/server";
import { apiResponse } from "@/lib/apiResponse";
import { apiError } from "@/lib/apiError";
import dbConnect from "@/lib/DbConnect";
import { Testimonial } from "@/models/Testimonials";
import { getServerSession } from "next-auth/next";
import { authOption } from "@/app/api/auth/[...nextauth]/options";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOption);
    if (!session || session.user.role !== "admin") return apiError("Unauthorized", 401);
    const { id } = await params;
    await dbConnect();
    await Testimonial.findByIdAndDelete(id);
    return apiResponse("Deleted", 200);
  } catch (error: any) {
    return apiError(error.message, 500);
  }
}
