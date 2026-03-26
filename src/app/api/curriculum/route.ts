import { apiResponse } from "@/lib/apiResponse";
import { apiError } from "@/lib/apiError";
import dbConnect from "@/lib/DbConnect";
import { Curriculum } from "@/models/Curriculum";
import { getServerSession } from "next-auth/next";
import { authOption } from "@/app/api/auth/[...nextauth]/options";
import { curriculumSchema } from "@/schemas/adminSchemas";

export async function GET() {
  try {
    await dbConnect();
    const curriculum = await Curriculum.findOne({ version: "v1" });
    if (!curriculum) {
      return apiResponse({ data: {} }, 200);
    }
    return apiResponse({ data: curriculum.treeData }, 200);
  } catch (error: any) {
    return apiError(error.message, 400);
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOption);
    if (!session || (session.user as any).role !== "admin") {
      return apiError("Unauthorized: Admins only", 401);
    }

    await dbConnect();
    const body = await request.json();
    const validation = curriculumSchema.safeParse(body);
    
    if (!validation.success) {
      return apiError(`Validation failed: ${validation.error.issues.map((e: any) => e.message).join(', ')}`, 400);
    }
    
    const { treeData } = validation.data;

    // Upsert the curriculum structure safely
    const curriculum = await Curriculum.findOneAndUpdate(
      { version: "v1" },
      { treeData: treeData || {} },
      { new: true, upsert: true }
    );

    return apiResponse({ data: curriculum.treeData }, 200);
  } catch (error: any) {
    return apiError(error.message, 500);
  }
}
