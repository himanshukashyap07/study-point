import { apiResponse } from "@/lib/apiResponse";
import { apiError } from "@/lib/apiError";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/DbConnect";
import { User } from "@/models/User";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const body = await req.json();
        const { username, email, password, avatar } = body;

        if (!username || !email || !password) {
            return apiError("Username, email, and password are required", 400);
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            if (!existingUser.isVerified) {
                return apiError("User with this email is not verified, please verify your email", 409);
            }
            return apiError("User with this email already exists", 409);
        }

        const assignedRole = "student";

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const secrete = await bcrypt.hash(email,10)

        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            avatar: avatar || "https://ik.imagekit.io/samanKridho/guest.png", 
            role: assignedRole,
            verificationCode:secrete,
            isVerified: false,
        });
        //send a Verification Email

        const emailResponse = await sendVerificationEmail(email, username,secrete);
        if (!emailResponse.success) {
            console.error("Warning: Verification email failed to send.");
        }

        return apiResponse({
            message: "User registered successfully",
            user: {
                _id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role,
            }
        }, 201);
    } catch (error: any) {
        console.error("Error during registration:", error);
        return apiError("Internal server error: " + error.message, 500);
    }
}
