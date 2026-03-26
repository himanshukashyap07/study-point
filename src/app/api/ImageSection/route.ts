import { getServerSession } from "next-auth";
import { authOption } from "../auth/[...nextauth]/options";
import { apiResponse } from "@/lib/apiResponse";
import { NextRequest } from "next/server";
import { ImageSection } from "@/models/ImagesSections";
import dbConnect from "@/lib/DbConnect";



export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const imageSections = await ImageSection.find({});
        return apiResponse(imageSections, 200);
    } catch (error) {
        return apiResponse("Internal Server Error", 500);
    }
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOption);
    if (!session || session.user.role !== "admin") {
        return apiResponse("Unauthorized", 401)
    }
    try {

        const { title, category, imageUrl, description } = await req.json();
        if (!title || !category || !imageUrl || !description) {
            return apiResponse("All fields are required", 400)
        }
        dbConnect()
        const imageSection = await ImageSection.create({ title, category, imageUrl, description })
        if (!imageSection) {
            return apiResponse("Failed to create image section", 500)
        }
        return apiResponse(imageSection, 201)
    } catch (error) {
        console.log(error);

        return apiResponse("Internal Server Error", 500)
    }
}