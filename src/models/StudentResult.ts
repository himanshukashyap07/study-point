import mongoose, { Schema, Document } from "mongoose"

export interface ISubjectResult {
    subject: string;
    marks: number;
}

export interface IStudentResult extends Document {
    student: mongoose.Types.ObjectId;
    course: mongoose.Types.ObjectId;
    subjects: [ISubjectResult];
    imageUrl: string;
    marksheet: string;
    year: number;
    isTopper?: boolean;
}

const StudentResultSchema = new Schema<IStudentResult>({
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    subjects: [{
        subject: { type: String, required: true },
        marks: { type: Number, required: true }
    }],
    imageUrl: { type: String },
    marksheet: { type: String },
    year: { type: Number, required: true },
    isTopper: { type: Boolean, default: false }
}, { timestamps: true })

export const StudentResult = mongoose.models.StudentResult || mongoose.model<IStudentResult>('StudentResult', StudentResultSchema)