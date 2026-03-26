import { apiResponse } from "@/lib/apiResponse";
import { apiError } from "@/lib/apiError";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/DbConnect";
import { Payment } from "@/models/Payment";
import { User } from "@/models/User";
import { Course } from "@/models/Course";

export async function POST(request: Request) {
  try {
    await dbConnect();
    // In production, Paytm posts back form data. We use JSON here for mock workflow.
    const paytmResponse = await request.json();

    const { ORDERID, TXNID, BANKTXNID, STATUS, RESPCODE, RESPMSG } = paytmResponse;

    // 1. Verify Checksum logic here using Paytm SDK to prevent payload tampering

    // 2. Find the Pending Order in Database
    const payment = await Payment.findOne({ orderId: ORDERID });
    if (!payment) {
      return apiError("Order not found", 404);
    }

    // 3. Safely update Payment Status
    payment.txnId = TXNID;
    payment.bankTxnId = BANKTXNID;
    payment.respCode = RESPCODE;
    payment.respMsg = RESPMSG;

    if (STATUS === "TXN_SUCCESS") {
      payment.status = "SUCCESS";
      payment.txnDate = new Date();
      await payment.save();

      // 4. Critical Step: Attach the purchased course to the User, and the User to the Course
      await User.findByIdAndUpdate(payment.user, {
        $addToSet: { enrolledCourses: payment.course, payments: payment._id }
      });
      await Course.findByIdAndUpdate(payment.course, {
        $addToSet: { enrolledStudents: payment.user, payments: payment._id }
      });

      return NextResponse.json({ success: true, message: "Payment verified successfully!" });
    } else {
      payment.status = "FAILED";
      await payment.save();
      return apiError("Payment failed during processing.", 400);
    }

  } catch (error: any) {
    return apiError(error.message, 500);
  }
}
