import { apiResponse } from "@/lib/apiResponse";
import { apiError } from "@/lib/apiError";
import { getServerSession } from "next-auth";
import { authOption } from "@/app/api/auth/[...nextauth]/options";
import PaytmChecksum from "paytmchecksum";
import https from "https";
import dbConnect from "@/lib/DbConnect";
import { Course } from "@/models/Course";


export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOption);
    if (!session || !session.user) {
      return apiError("Unauthorized", 401);
    }

    const { courseId } = await req.json();
    if (!courseId) return apiError("courseId is required", 400);

    await dbConnect();
    const course = await Course.findById(courseId);
    if (!course) return apiError("Course not found", 404);

    const orderId = `ORDER_${Date.now()}_${session.user.id || session.user.email?.split('@')[0]}`;
    const amount = course.price.toString();

    // MOCK MODE if no keys provided
    if (!process.env.PAYTM_MID || !process.env.PAYTM_MERCHANT_KEY) {
      console.warn("PAYTM credentials missing. Returning Mock Token.");
      return apiResponse({
        txnToken: "MOCK_TOKEN_TEST",
        orderId,
        amount
      }, 200);
    }

    const paytmParams: any = {};
    paytmParams.body = {
      requestType: "Payment",
      mid: process.env.PAYTM_MID,
      websiteName: process.env.PAYTM_WEBSITE || "WEBSTAGING",
      orderId: orderId,
      callbackUrl: `${process.env.NEXTAUTH_URL}/api/paytm/verify`, // Or frontend callback
      txnAmount: {
        value: amount,
        currency: "INR",
      },
      userInfo: {
        custId: session.user.email || "CUST_001",
      },
    };

    const checksum = await PaytmChecksum.generateSignature(
      JSON.stringify(paytmParams.body),
      process.env.PAYTM_MERCHANT_KEY
    );

    paytmParams.head = { signature: checksum };

    const post_data = JSON.stringify(paytmParams);

    const options = {
      hostname: "securegw-stage.paytm.in", // Use securegw.paytm.in for production
      port: 443,
      path: `/theia/api/v1/initiateTransaction?mid=${process.env.PAYTM_MID}&orderId=${orderId}`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": post_data.length,
      },
    };

    return new Promise((resolve, reject) => {
      let response = "";
      const post_req = https.request(options, (post_res) => {
        post_res.on("data", (chunk) => {
          response += chunk;
        });
        post_res.on("end", () => {
          try {
            const parsed = JSON.parse(response);
            if (parsed.body && parsed.body.txnToken) {
              resolve(apiResponse({
                txnToken: parsed.body.txnToken,
                orderId,
                amount
              }, 200));
            } else {
              resolve(apiError(parsed.body?.resultInfo?.resultMsg || "Failed to initiate transaction", 400));
            }
          } catch (e) {
            resolve(apiError("Invalid response from Paytm", 500));
          }
        });
      });

      post_req.on("error", (e) => resolve(apiError(e.message, 500)));
      post_req.write(post_data);
      post_req.end();
    });

  } catch (error: any) {
    return apiError(error.message, 500);
  }
}
