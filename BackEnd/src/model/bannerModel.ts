import mongoose from "mongoose"


export interface bannerType extends Document {
title:string;
content:string;
image:string;
link:string;
isActive:boolean
}

const bannerSchema=new mongoose.Schema({
    title:{type:String,required:true},
    content:{type:String,required:true},
    image:{type:String,required:true},
    link:{type:String},//redirect link
    isActive:{type:Boolean},
  
},
{timestamps:true})
const Banner = mongoose.model<bannerType>('Banner', bannerSchema)

export default Banner