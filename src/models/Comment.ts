import mongoose, { Document, Schema, model, models } from "mongoose";

export interface IComment extends Document {
    comment: string;
    user: mongoose.Types.ObjectId; 
    video: mongoose.Types.ObjectId;
    likesCount: number;
}

const CommentSchema = new Schema<IComment>({
    comment: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    video: { type: Schema.Types.ObjectId, ref: 'Video', required: true },
    likesCount: { type: Number, default: 0 }
}, { timestamps: true });

export const Comment = models.Comment || model<IComment>('Comment', CommentSchema);
