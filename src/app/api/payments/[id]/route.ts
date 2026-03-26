import { apiResponse } from "@/lib/apiResponse";
import { apiError } from "@/lib/apiError";
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/DbConnect";
import { Payment } from "@/models/Payment";
import { User } from "@/models/User";
import { Course } from "@/models/Course";
import { getServerSession } from "next-auth/next";
import { authOption } from "@/app/api/auth/[...nextauth]/options";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const session = await getServerSession(authOption);
    if (!session || !session.user || session.user.role !== 'admin') {
      return apiError("Forbidden: Admin access required", 403);
    }

    await dbConnect();
    const deletedPayment = await Payment.findByIdAndDelete(id);

    if (!deletedPayment) {
      return apiError("Payment not found", 404);
    }

    // Remove reference from User
    await User.findByIdAndUpdate(deletedPayment.user, {
      $pull: { payments: deletedPayment._id }
    });

    return apiResponse({ message: "Payment deleted successfully" }, 200);
  } catch (error: any) {
    return apiError(error.message, 400);
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const session = await getServerSession(authOption);
    if (!session || !session.user || (session.user.role !== 'admin' && session.user.role !== 'instructor')) {
      return apiError("Forbidden: Elevated access required", 403);
    }

    await dbConnect();
    const body = await request.json();

    const allowedFields = ['status', 'amount', 'orderId', 'txnId', 'bankTxnId', 'user', 'course'];
    const updateData: any = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return apiError("No valid fields provided to update", 400);
    }

    const previousPayment = await Payment.findById(id);
    if (!previousPayment) {
      return apiError("Payment not found", 404);
    }

    const updatedPayment = await Payment.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    // If status changed to SUCCESS, ensure enrollments are updated
    if (previousPayment.status !== 'SUCCESS' && updatedPayment.status === 'SUCCESS') {
      await User.findByIdAndUpdate(updatedPayment.user, {
        $addToSet: { enrolledCourses: updatedPayment.course, payments: updatedPayment._id }
      });

      await Course.findByIdAndUpdate(updatedPayment.course, {
        $addToSet: { enrolledStudents: updatedPayment.user }
      });
    }

    return apiResponse({ data: updatedPayment, message: "Payment updated successfully" }, 200);
  } catch (error: any) {
    return apiError(error.message, 400);
  }
}
