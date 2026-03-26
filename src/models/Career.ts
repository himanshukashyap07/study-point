import {Document, model, models, Schema} from "mongoose";

export interface ICareer extends Document{
    title:string;
    description:string;
    imageUrl:string;
    positionsAvailable:number;
    location:string;
    salaryRange:string;
    endDate:Date;
}

const CareerSchema = new Schema<ICareer>({
    title:{type:String,required:true},
    description:{type:String,required:true},
    imageUrl:{type:String,required:true},
    positionsAvailable:{type:Number,required:true},
    location:{type:String,required:true},
    salaryRange:{type:String,required:true},
    endDate:{type:Date,required:true}
},{timestamps:true})

export const Career = models.Career || model<ICareer>('Career',CareerSchema)