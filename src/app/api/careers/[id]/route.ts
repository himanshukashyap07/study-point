import { NextRequest } from "next/server";
import { apiResponse } from "@/lib/apiResponse";
import { apiError } from "@/lib/apiError";
import dbConnect from "@/lib/DbConnect";
import { Career } from "@/models/Career";
import { getServerSession } from "next-auth/next";
import { authOption } from "@/app/api/auth/[...nextauth]/options";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOption);
    if (!session || session.user.role !== "admin") return apiError("Unauthorized", 401);

    await dbConnect();
    await Career.findByIdAndDelete(params.id);
    return apiResponse("Deleted", 200);
  } catch (error: any) {
    return apiError(error.message, 500);
  }
}
