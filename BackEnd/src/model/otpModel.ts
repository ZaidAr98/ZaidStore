import mongoose, { Types } from 'mongoose';


export interface otpType extends Document {
    email:string;
    otp:string; 
    createdAt: Date; 
}
const otpSchema  = new mongoose.Schema<otpType>({
    email:{
        type:String,
        required:true
    },
    otp:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now,
        expires:60*1.5 //document automatically delete after 1 minute
    }
});

const OTP = mongoose.model<otpType>('otpSchema ', otpSchema );

export default OTP;