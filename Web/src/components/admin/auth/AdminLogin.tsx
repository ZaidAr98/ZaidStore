import { adminAxiosInstance } from '@/config/axiosConfig';
import { useAppDispatch } from '@/store/store'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Toaster ,toast} from 'react-hot-toast';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from "yup";
import { setadminDetails } from '@/store/slices/adminSlice';

interface FormValue {
    email:string;
    password : string;
}

const AdminLogin = () => {


    const [error,setError] = useState<string>("")
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

  const initialValues : FormValue = {
    email :"",
    password:""

}
const onSubmit = async(values:FormValue) => {
    // Handle form submission

    
   
    
    setError("")
    console.log('Form submitting', values);
    //post req in try catch
    //set admin credentials in redux
    try {
      const response = await adminAxiosInstance.post('/api/admin',values)
      toast.success("Admin logged in successfully")
      console.log(response.data);
      
      dispatch(setadminDetails(response.data.admin))
      localStorage.setItem("adminAccessToken",response.data.adminAccessToken)
      setTimeout(()=>{
        navigate('/')
      },500)
      
     
      console.log("Admin logged in successfully",response.data);
      
    } catch (error:any) {
      console.log("error in admin login",error.message);
      toast.error("Something went wrong.")
      setError("Something went wrong")
    }
  };


  return (
<div className="flex items-center justify-center min-h-screen bg-white">
      <Toaster/>
      <div className="w-full max-w-md p-8 space-y-6">
        {/* Logo */}
        <div className="flex justify-center">
          <img
            src="/images/.png"
            alt="Zaid Logo"
            className="w-60 h-60"
          />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center">ADMIN LOGIN</h2>
        {error && (<p className='text-sm text-red-500'>{error}</p>)}
        {/* Formik Form */}
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          {({ touched, errors }) => (
            <Form className="mt-6 space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium">
                  Email
                </label>
                <Field
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter Email Here"
                  className={`w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 ${
                    touched.email && errors.email ? 'border-red-500' : 'focus:ring-primary'
                  }`}
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium">
                  Password
                </label>
                <Field
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Enter Password Here"
                  className={`w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 ${
                    touched.password && errors.password ? 'border-red-500' : 'focus:ring-primary'
                  }`}
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full py-2 mt-4 font-semibold text-white bg-black hover:bg-opacity-90 rounded-md"
                >
                  Login
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  )
}

export default AdminLogin

