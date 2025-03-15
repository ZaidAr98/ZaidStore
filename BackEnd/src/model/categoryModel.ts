import mongoose, { Types } from "mongoose";


export interface CategoryInput extends Document {
    name: string; 
    description: string; 
    isListed: Boolean; 
    createdAt: Date; 
}

const categorySchema =new mongoose.Schema<CategoryInput>({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    isListed:{
        type:Boolean,
        default:true
    },
    createdAt:{
        type:Date,
        default:Date.now()
    }
})
const Category = mongoose.model<CategoryInput>('Category', categorySchema);

export default Category;