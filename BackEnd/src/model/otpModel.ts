import mongoose, { Types } from 'mongoose';
import { sendVerificationEmail } from '../utils/nodeMailer/sendVerificationEmail';


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

otpSchema.pre("save",async function (next) {
    console.log("New document saved to database");
    //only send email when a anew document is created
    if(this.isNew){
        await sendVerificationEmail(this.email,this.otp)
    }
    next();
    
})

const OTP = mongoose.model<otpType>('otpSchema ', otpSchema );

export default OTP;