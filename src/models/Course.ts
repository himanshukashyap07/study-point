import mongoose, { Document, Schema, model, models } from "mongoose";

export interface ICourse extends Document {
    title: string;
    description: string;
    category: string;
    board: string;
    medium: string;
    class: string;
    subject: string;
    price: number;
    isFree:boolean;
    thumbnail: string;

    instructors: mongoose.Types.ObjectId[];
    enrolledStudents: mongoose.Types.ObjectId[];
    videoList: mongoose.Types.ObjectId[];
    totalVideo: number;
    totalDuration: number;
}

const CourseSchema = new Schema<ICourse>({
    title: { type: String, required: true },
    description: { type: String, default: "" },
    category: { type: String, required: true },
    board: { type: String, required: true },
    medium: { type: String, required: true },
    class: { type: String, required: true },
    subject: { type: String, required: true },
    price: { type: Number, default: 0 },
    thumbnail: { type: String, default: "" },
    isFree:{type:Boolean,default:false},
    instructors: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    enrolledStudents: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    videoList: [{ type: Schema.Types.ObjectId, ref: 'Video' }],
    totalVideo: { type: Number, default: 0 },
    totalDuration: { type: Number, default: 0 }
}, { timestamps: true });

export const Course = models.Course || model<ICourse>('Course', CourseSchema);
