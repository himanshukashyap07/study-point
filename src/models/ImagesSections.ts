import { Document,Schema,model,models } from "mongoose";


export interface IImageSection extends Document{
    title:string;
    category:string;
    imageUrl:string[];
    description:string;
}

const ImageSectionSchema = new Schema<IImageSection>({
    title:{type:String,required:true},
    category:{type:String,required:true},
    imageUrl:[{type:String,required:true}],
    description:{type:String,required:true}
},{timestamps:true})

export const ImageSection = models.ImageSection || model<IImageSection>('ImageSection',ImageSectionSchema)