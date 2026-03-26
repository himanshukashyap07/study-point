import { getServerSession } from "next-auth";
import { authOption } from "@/app/api/auth/[...nextauth]/options";
import { apiResponse } from "@/lib/apiResponse";
import { NextRequest } from "next/server";
import { ImageSection } from "@/models/ImagesSections";
import dbConnect from "@/lib/DbConnect";



export async function PATCH(req:NextRequest, context:{params:Promise<{id:string}>}){
    const session = await getServerSession(authOption);
    if(!session|| session.user.role!=="admin"){
        return apiResponse("Unauthorized",401)
    }
    try {
        const {id} = await context.params;
        const {imageUrl} = await req.json();
        if (!imageUrl) {
            return apiResponse("Image URL is required",400)
        }
        dbConnect()
        const imageSection = await ImageSection.findByIdAndUpdate(
            id,
            {$push:{imageUrl}},
            {returnDocument:"after"}
        )
        if(!imageSection){
            return apiResponse("Failed to update image section",500)
        }
        return apiResponse(imageSection,201)
    } catch (error) {
        return apiResponse("Internal Server Error",500)
    }
}
export async function DELETE(req:NextRequest, context:{params:Promise<{id:string}>}){
    const session = await getServerSession(authOption);
    if(!session|| session.user.role!=="admin"){
        return apiResponse("Unauthorized",401)
    }
    try {
        const {id} = await context.params;
    
        dbConnect()
        const imageSection = await ImageSection.findByIdAndDelete(id)
        if(!imageSection){
            return apiResponse("Failed to delete image section",500)
        }
        return apiResponse(imageSection,201)
    } catch (error) {
        return apiResponse("Internal Server Error",500)
    }
}