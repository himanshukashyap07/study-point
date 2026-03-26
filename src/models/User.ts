import mongoose, { Schema, model, models, Document } from 'mongoose';


export interface IUser extends Document {
    username: string;
    avatar:string;
    email: string;
    password: string;
    role: 'student' | 'instructor' | 'admin';
    verificationCode:string;
    enrolledCourses: mongoose.Types.ObjectId[];
    payments: mongoose.Types.ObjectId[];
    isBlock: boolean;
    isVerified: boolean;
}

const UserSchema = new Schema<IUser>({
    username: { type: String, required: true },
    avatar: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'instructor', 'admin'], default: 'student' },

    enrolledCourses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
    payments: [{ type: Schema.Types.ObjectId, ref: 'Payment' }],
    verificationCode:{type:String},
    isBlock: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false }
}, { timestamps: true });

export const User = models.User || model<IUser>('User', UserSchema);
