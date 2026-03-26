import mongoose, { Schema, Document } from 'mongoose';

export interface ICurriculum extends Document {
  version: string;
  treeData: any; // Storing the highly nested JSON CMS tree
}

const curriculumSchema: Schema = new Schema({
  version: { type: String, default: "v1", unique: true },
  treeData: { type: Schema.Types.Mixed, default: {} }
}, { timestamps: true });

export const Curriculum = mongoose.models.Curriculum || mongoose.model<ICurriculum>('Curriculum', curriculumSchema);
