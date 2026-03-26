import { apiResponse } from "@/lib/apiResponse";
import { apiError } from "@/lib/apiError";
import { getServerSession } from "next-auth";
import { authOption } from "@/app/api/auth/[...nextauth]/options";
import PaytmChecksum from "paytmchecksum";
import dbConnect from "@/lib/DbConnect";
import { User } from "@/models/User";
import { Course } from "@/models/Course";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOption);
    if (!session || !session.user || !session.user.email) {
      return apiError("Unauthorized", 401);
    }

    const body = await req.json();
    const { courseId, orderId, txnToken, isMock } = body;

    await dbConnect();

    // MOCK VERIFICATION
    if (isMock && (!process.env.PAYTM_MID || !process.env.PAYTM_MERCHANT_KEY)) {
      // Allow mock bypassing only if keys are missing (dev mode)
      const userId = (session.user as any)._id;
      if (userId) {
        await User.findByIdAndUpdate(userId, { $addToSet: { enrolledCourses: courseId } });
        await Course.findByIdAndUpdate(courseId, { $addToSet: { enrolledStudents: userId } });
      }
      return apiResponse({ message: "Mock Payment Verified", success: true }, 200);
    }

    if (!body.paytmResponse) {
      return apiError("Payment response missing", 400);
    }

    const paytmParams = body.paytmResponse;
    const paytmChecksum = paytmParams.CHECKSUMHASH;
    delete paytmParams.CHECKSUMHASH;

    const isVerifySignature = PaytmChecksum.verifySignature(
      paytmParams,
      process.env.PAYTM_MERCHANT_KEY!,
      paytmChecksum
    );

    if (isVerifySignature) {
      if (paytmParams.STATUS === "TXN_SUCCESS") {
        const userId = (session.user as any)._id;
        if (userId) {
          await User.findByIdAndUpdate(userId, { $addToSet: { enrolledCourses: courseId } });
          await Course.findByIdAndUpdate(courseId, { $addToSet: { enrolledStudents: userId } });
        }
        return apiResponse({ message: "Payment Verified successfully", success: true }, 200);
      } else {
        return apiError("Payment Failed", 400);
      }
    } else {
      return apiError("Checksum mismatched", 400);
    }
  } catch (error: any) {
    return apiError(error.message, 500);
  }
}
