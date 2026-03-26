import { apiError } from "@/lib/apiError";
import { apiResponse } from "@/lib/apiResponse";
import dbConnect from "@/lib/DbConnect";
import { User } from "@/models/User";
import { secretVerification } from "@/schemas/User";

import { NextRequest } from "next/server";



export async function GET(req:NextRequest){
    const {searchParams} = new URL(req.url)
    const mail = searchParams.get("email")||""
    const secretCode = searchParams.get("secret") ||""
    try {
        const validateParams = secretVerification.safeParse({email:mail,secret:secretCode})
        if (!validateParams.success) {
            return apiError("params are invalid",400)
        }
        const {email,secret} = validateParams.data
        await dbConnect()
        const user = await User.findOne({email})
        if (!user) {
            return apiError("user not found",404)
        }
        
        const isSecretCorrect = (secret === user.verificationCode);
        if (!isSecretCorrect) {
            return apiError("sercret is wrong",400)
        }
        await User.findOneAndUpdate({email:user.email},{
            $set:{
                isVerified:true
            },
            $unset:{
                verificationCode:1
            }
        })
        
        return apiResponse("user verification successfully",200)
    } catch (error) {
        return apiError("Internal server error in verifing User")
    }

}