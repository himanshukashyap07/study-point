import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IVideo extends Document {
    title: string;
    description: string;
    videoUrl: string;
    thumbnail: string;

    order: number;
    duration: number;
    isFree: boolean;
    resources: string[];
    courseId: mongoose.Types.ObjectId;
}

const VideoSchema = new Schema<IVideo>({
    title: { type: String, required: true },
    description: { type: String, default: "" },
    videoUrl: { type: String, required: true },
    thumbnail: { type: String, required: true },

    order: { type: Number, required: true },
    duration: { type: Number, required: true },
    isFree: { type: Boolean, default: false },
    resources: [{ type: String }],
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true }
}, { timestamps: true });

export const Video = models.Video || model<IVideo>('Video', VideoSchema);
