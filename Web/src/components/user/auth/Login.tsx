import { axiosInstance } from '@/config/axiosConfig';
import { setUserDetails } from '@/store/slices/userSlice';
import { useAppDispatch } from '@/store/store';
import React, { useState } from 'react'
import toast, { Toaster } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import * as Yup from "yup";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import GoogleAuth from './GoogleAuth';
import { EyeIcon, EyeOff } from 'lucide-react';

interface FormValue {
    email:string;
    password : string;
}





const Login = () => {

const initialValues : FormValue = {
    email :"",
    password:""

}

const [formData,setFormData] = useState<FormValue | null>(null)
const [error,setError] = useState<string>("") 
const [showPassword,setShowPassword] = useState<boolean>(false)

const dispatch = useAppDispatch()
const navigate = useNavigate()

const validationSchema = Yup.object({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  });

const handleSubmit = async (values:FormValue) =>{
    console.log("Login attempeted with:",values)
    setFormData(values)
    setError("")


try {
    const response = await axiosInstance.post('/api/users/login',values)
    if(response?.data){
        const { accessToken } = response.data;

        //store access token in localstorage
        localStorage.setItem("accessToken", accessToken);
        console.log("responw", response?.data);

        dispatch(setUserDetails(response?.data?.user));
        toast.success("User logged in successfully.");
        setTimeout(() => {
          navigate("/");
        }, 1000);
      }
    }
 catch (error:any) {
    toast.error("Login failed. Please try again.");
      setError(error?.response?.data?.message||"Something went wrong! Please try again.")  
}



}




  return (
    <div className="w-full max-w-md ">
  
    <Toaster />
  
      
        <h2 className="text-3xl font-semibold mb-6 text-center">Login to your account</h2>
        {error && (
          <div className="mt-3 text-base text-center text-red-600">
            {error}
          </div>
        )}
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Field
                  as={Input}
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>
              <div className="space-y-2 relative">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    className="text-sm hover:text-blue-900"
                    to="/forget-password"
                  >
                    forget password?
                  </Link>
                </div>

                <Field
                  as={Input}
                  type={showPassword?'text':"password"}
                  id="password"
                  name="password"
                  placeholder="Enter password"
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-500 text-sm"
                />
                {/* Eye icon for toggling visibility */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 pt-6 transform -translate-y-1/2 text-gray-400  "
                >
                 
                  {showPassword ? <EyeIcon/> :<EyeOff/>}
                </button>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Logging in..." : "Login"}
              </Button>
            </Form>
          )}
        </Formik>

        <div className="mt-4">
          <GoogleAuth />
        </div>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-medium text-primary hover:underline"
          >
            Sign up
          </Link>
        </p>
      
    
   
  </div>
  )
}

export default Login