import { NextRequest } from "next/server";
import { apiResponse } from "@/lib/apiResponse";
import { apiError } from "@/lib/apiError";
import { StudentResult } from "@/models/StudentResult";
import { User } from "@/models/User";
import { Course } from "@/models/Course";
import dbConnect from "@/lib/DbConnect";
import { getServerSession } from "next-auth";
import { authOption } from "@/app/api/auth/[...nextauth]/options";

export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const topRankers = searchParams.get('topRankers') === 'true';

        if (topRankers) {
            const results = await StudentResult.find({}).sort({ year: -1, createdAt: -1 }).populate({ path: 'student', select: 'username avatar', model: User }).populate({ path: 'course', select: 'title', model: Course });
            const formattedResults = results.map(r => {
                let totalMarks = 0;
                r.subjects.forEach((s: any) => { totalMarks += s.marks });
                return { ...r.toObject(), totalScore: totalMarks };
            }).sort((a: any, b: any) => b.totalScore - a.totalScore).slice(0, 5);
            return apiResponse(formattedResults, 200);
        }

        // Pagination & Searching
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const courseId = searchParams.get('courseId');
        const year = searchParams.get('year');

        const filter: any = {};
        if (courseId) filter.course = courseId;
        if (year) filter.year = year;

        const skip = (page - 1) * limit;
        const [results, total] = await Promise.all([
            StudentResult.find(filter)
                .sort({ year: -1, createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate({ path: 'student', select: 'username avatar', model: User })
                .populate({ path: 'course', select: 'title', model: Course }),
            StudentResult.countDocuments(filter)
        ]);

        let formattedResults = results.map(r => {
            let totalMarks = 0;
            r.subjects.forEach((s: any) => { totalMarks += s.marks });
            return { ...r.toObject(), totalScore: totalMarks };
        });

        formattedResults.sort((a, b) => b.totalScore - a.totalScore);

        return apiResponse({ data: formattedResults, total, page, limit, totalPages: Math.ceil(total / limit) }, 200);
    } catch (error: any) {
        console.error("StudentResult GET Error:", error);
        return apiError(error.message || "Internal Server Error", 500);
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOption);
        if (!session || !session.user) return apiError("Unauthorized", 401);

        const { courseId, subjects, imageUrl, year, marksheet } = await req.json();

        if (!courseId || !subjects || !year) {
            return apiError("All fields are required", 400);
        }

        await dbConnect();
        let obj: any = {}
        if (imageUrl) {
            obj.imageUrl = imageUrl
        }
        if (marksheet) {
            obj.marksheet = marksheet
        }

        // Let students upload their result
        const newResult = await StudentResult.create({
            student: (session.user as any)._id,
            course: courseId,
            subjects,
            ...obj,
            year
        });

        return apiResponse(newResult, 201);
    } catch (error: any) {
        console.log(error);

        return apiError(error.message, 500);
    }
}



export async function DELETE(req: NextRequest) {
    const session = await getServerSession(authOption)

    if (!session || !session.user) {
        return apiError("unauthorized request", 401)
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    try {
        await dbConnect()
        const result = await StudentResult.findByIdAndDelete(id)
        if (!result) {
            return apiError("result not found", 404)
        }
        return apiResponse("Result deleted successfull", 200)
    } catch (error) {
        console.log(error);
        return apiError("Internal server Error", 500)
    }
}