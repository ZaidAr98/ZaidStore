import { mailSender } from "./mailSender";

export const sendVerificationEmail=async(email:string,otp:string)=>{
    console.log("sendverificationemail",email);

    try {
       const mailResponse = await mailSender(
        email,
        "Zaid Store - Verify Your Email",
        `
        <div  style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #0a74da;">Welcome to Zaid!</h2>
          <p>Dear user,</p>
          <p>Thank you for registering with <strong>Zaid</strong>. To complete your sign-up process, please verify your email address by using the OTP code provided below:</p>
          <div style="text-align: center; margin: 20px 0;">
            <span style="font-size: 24px; font-weight: bold; background-color: #f2f2f2; padding: 10px; border-radius: 5px;">${otp}</span>
          </div>
          <p>If you did not request this, please ignore this email or contact our support team.</p>
          <p>We look forward to providing you with the best skin care products for brigting your soul and body.</p>
          <p>Best regards,<br/> Team Zaid</p>
          <hr style="border: none; border-top: 1px solid #ccc;" />
          <p style="font-size: 12px; color: #777;">This email was sent from an unmonitored account. Please do not reply to this email.</p>
        </div>`
       ) 
       console.log("email sent");
       
    } catch (error) {
        console.log("error in verification mail response",error);
        
    }
}



