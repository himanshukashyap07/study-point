import { apiResponse } from "@/lib/apiResponse";
import { apiError } from "@/lib/apiError";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/DbConnect";
import { User } from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOption } from "@/app/api/auth/[...nextauth]/options";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOption);

        if (!session || !session.user || session.user.role !== 'admin') {
            return apiError("Forbidden: Only admins can create instructors", 403);
        }

        await dbConnect();
        const body = await req.json();
        const { username, email, password, avatar } = body;

        if (!username || !email || !password) {
            return apiError("Username, email, and password are required", 400);
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return apiError("User with this email already exists", 409);
        }

        // Assigned role is strictly instructor
        const assignedRole = "instructor";

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            avatar: avatar || "https://ui-avatars.com/api/?name=" + encodeURIComponent(username), 
            role: assignedRole,
            isVerified: true, // Auto-verify since an admin created them
        });

        return apiResponse({
            message: "Instructor created successfully",
            user: {
                _id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role,
            }
        }, 201);
    } catch (error: any) {
        console.error("Error creating instructor:", error);
        return apiError("Internal server error: " + error.message, 500);
    }
}
