

import mongoose, { Document, Schema } from "mongoose";


export interface ITestimonial extends Document{
    name:string;
    role:string;
    testimonial:string;
    imageUrl:string;
}


const TestimonialSchema = new Schema<ITestimonial>({
    name:{type:String,required:true},
    role:{type:String,required:true},
    testimonial:{type:String,required:true},
    imageUrl:{type:String,required:true}
},{timestamps:true})

export const Testimonial = mongoose.models.Testimonial || mongoose.model<ITestimonial>('Testimonial',TestimonialSchema)