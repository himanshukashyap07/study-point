import { apiResponse } from "@/lib/apiResponse";
import { apiError } from "@/lib/apiError";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/DbConnect";
import { Payment } from "@/models/Payment";
import { User } from "@/models/User";
import { Course } from "@/models/Course";
import { getServerSession } from "next-auth/next";
import { authOption } from "@/app/api/auth/[...nextauth]/options";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOption);
    if (!session || !session.user) {
      return apiError("Unauthorized", 401);
    }

    await dbConnect();
    const body = await request.json();

    const payment = await Payment.create(body);

    // If payment is successful, update User and Course schemas
    if (payment.status === 'SUCCESS') {
      await User.findByIdAndUpdate(payment.user, {
        $addToSet: { enrolledCourses: payment.course, payments: payment._id }
      });

      await Course.findByIdAndUpdate(payment.course, {
        $addToSet: { enrolledStudents: payment.user }
      });
    } else {
      // Just record the payment if pending or failed
      await User.findByIdAndUpdate(payment.user, {
        $addToSet: { payments: payment._id }
      });
    }

    return apiResponse({ data: payment }, 201);
  } catch (error: any) {
    return apiError(error.message, 400);
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOption);
    if (!session || !session.user) {
      return apiError("Unauthorized", 401);
    }

    await dbConnect();
    const payments = await Payment.find({ user: session.user.id }).populate({ path: 'course', select: 'title price', model: Course });
    return apiResponse({ data: payments });
  } catch (error: any) {
    return apiError(error.message, 400);
  }
}
