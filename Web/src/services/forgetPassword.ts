import { axiosInstance } from "@/config/axiosConfig";

export const sendOtp=(email:string)=>axiosInstance.post('/api/users/forget-password',{email})

export const resendOtp=(email:string)=>axiosInstance.post('/api/users/resend-otp',{email})

export const verifyOtp=(email:string,otp:string)=>axiosInstance.post('/api/users/reset/verify-otp',{email,otp})

export const resetPassword=(email:string,password:string)=>axiosInstance.post('/api/users/reset-password',{email,password})