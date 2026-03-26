import { apiResponse } from "@/lib/apiResponse";
import { apiError } from "@/lib/apiError";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/DbConnect";
import { Payment } from "@/models/Payment";
import crypto from "crypto";
// @ts-ignore
import PaytmChecksum from "paytmchecksum";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { userId, courseId, amount } = await request.json();

    if (!userId || !courseId || !amount) {
      return apiError("Missing userId, courseId, or amount fields", 400);
    }

    // 1. Generate a unique Order ID for Paytm
    const orderId = `ORDER_${crypto.randomBytes(8).toString("hex").toUpperCase()}`;

    // 2. Create a PENDING payment record in our Mongo database
    const payment = await Payment.create({
      user: userId,
      course: courseId,
      orderId: orderId,
      amount: amount,
      currency: "INR",
      status: "PENDING",
      gatewayName: "Paytm"
    });

    // 3. Official Paytm Initiation
    const paytmParams: any = {
      MID: process.env.PAYTM_MID || "MOCK_MERCHANT_ID",
      ORDER_ID: orderId,
      CUST_ID: userId.toString(),
      TXN_AMOUNT: amount.toString(),
      CHANNEL_ID: "WEB",
      INDUSTRY_TYPE_ID: "Retail",
      WEBSITE: process.env.PAYTM_WEBSITE || "WEBSTAGING",
      CALLBACK_URL: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/payment/paytm-callback`
    };

    const paytmChecksum = await PaytmChecksum.generateSignature(
        paytmParams, 
        process.env.PAYTM_MERCHANT_KEY || "MOCK_MERCHANT_KEY"
    );

    // Attach checksumhash to the params
    paytmParams.CHECKSUMHASH = paytmChecksum;

    return NextResponse.json({
      success: true,
      paymentId: payment._id,
      paytmParams: paytmParams
    }, { status: 201 });

  } catch (error: any) {
    return apiError(error.message, 500);
  }
}
