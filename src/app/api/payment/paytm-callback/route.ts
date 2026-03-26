import { NextResponse } from "next/server";
import dbConnect from "@/lib/DbConnect";
import { Payment } from "@/models/Payment";
import { User } from "@/models/User";
import { Course } from "@/models/Course";
// @ts-ignore
import PaytmChecksum from "paytmchecksum";

export async function POST(request: Request) {
  try {
    await dbConnect();
    
    // Paytm sends a POST request with application/x-www-form-urlencoded
    const formData = await request.formData();
    const body: any = {};
    for (const [key, value] of formData.entries()) {
      body[key] = value;
    }

    const paytmChecksum = body.CHECKSUMHASH;
    delete body.CHECKSUMHASH;

    // Verify Signature
    const isVerifySignature = PaytmChecksum.verifySignature(
      body, 
      process.env.PAYTM_MERCHANT_KEY || "MOCK_MERCHANT_KEY", 
      paytmChecksum
    );

    const orderId = body.ORDERID;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    if (isVerifySignature) {
      // Signature is valid
      if (body.STATUS === 'TXN_SUCCESS') {
        const payment = await Payment.findOneAndUpdate(
          { orderId: orderId },
          { 
            $set: { 
              status: 'SUCCESS',
              txnId: body.TXNID,
              bankTxnId: body.BANKTXNID,
              paymentMode: body.PAYMENTMODE,
              respCode: body.RESPCODE,
              respMsg: body.RESPMSG,
              txnDate: body.TXNDATE
            } 
          },
          { new: true }
        );

        if (payment) {
          // Update User and Course
          await User.findByIdAndUpdate(payment.user, {
            $addToSet: { enrolledCourses: payment.course, payments: payment._id }
          });
    
          await Course.findByIdAndUpdate(payment.course, {
            $addToSet: { enrolledStudents: payment.user }
          });
        }

        // Redirect to a success page
        return NextResponse.redirect(`${baseUrl}/payment/success`);
      } else {
        // Transaction Failed or Pending
        await Payment.findOneAndUpdate(
          { orderId: orderId },
          { 
            $set: { 
              status: 'FAILED',
              txnId: body.TXNID,
              respCode: body.RESPCODE,
              respMsg: body.RESPMSG 
            } 
          }
        );
        // Redirect to a failure page
        return NextResponse.redirect(`${baseUrl}/payment/failure`);
      }
    } else {
      // Invalid Signature
      console.error("Checksum Mismatched");
      return NextResponse.redirect(`${baseUrl}/payment/failure`);
    }

  } catch (error: any) {
    console.error("Paytm Callback Error:", error);
    // Best practice is to redirect back to app even on error
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return NextResponse.redirect(`${baseUrl}/payment/failure`);
  }
}
