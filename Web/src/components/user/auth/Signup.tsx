import { Formik, Form, Field, ErrorMessage } from "formik";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import OTPEnterModal from "./OTPEnterModal";
import { axiosInstance } from "@/config/axiosConfig";
import { useNavigate } from "react-router-dom";
import { setUserDetails } from "@/store/slices/userSlice";
import { Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import validationSchema from "../../../utils/validation/userValidations";
import GoogleAuth from "./GoogleAuth";
import { useAppDispatch } from "../../../store/store";

interface FormValues {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}
interface otpValue {
  otp: string;
}

const Signup = () => {
  const initialValues: FormValues = {
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  };
  const [formData, setFormData] = useState<FormValues | null>(null);
  const [isOTPModelOpen, setIsOTPModelOpen] = useState<boolean>(false);
  const [otpMessage, setOtpMessage] = useState<string>("");
  const [otpErrMessage, setOtpErrMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (values: FormValues) => {
    console.log("signup attempted with:", values);
    setFormData(values);
    try {
      const response = await axiosInstance.post("/api/users/send-otp", {
        email: values.email,
      });
      if (response?.data?.success) {
        setIsOTPModelOpen(true);
        toast.success("OTP sent successfully. Please check your email.");
        setOtpMessage("OTP sent successfully. Please check your email.");
        setOtpErrMessage("");
        setError("");
      }
    } catch (error: any) {
      if (error?.response) {
        setError(error.response?.data?.message);
      }
      console.log(error);
    }
  };

  const handleOTPSubmit = async (otp: string) => {
    console.log("OTP submitted", otp, formData?.email);
    try {
      const response = await axiosInstance.post("/api/users/verify-otp", {
        otp,
        email: formData?.email,
      });
      console.log("otp verified", response);
      toast.success("OTP verified.");
      console.log(response?.data);
      if (response?.data?.invalid) {
        setOtpErrMessage(response.data.message);
        setOtpMessage("");
      }

      if (response?.data.expires) {
        setOtpErrMessage(response.data.message);
        setOtpMessage("");
      }

      if (response?.data?.success) {
        setIsOTPModelOpen(false);
        handleFormSubmit();
      }
    } catch (error) {
      console.error("error verifying otp", error);
    }
  };

  const handleFormSubmit = async () => {
    try {
      setError("");
      const response = await axiosInstance.post("/api/users/signup", {
        name: formData?.name,
        email: formData?.email,
        phone: formData?.phone,
        password: formData?.password,
      });
      console.log(response.data);

      if (response?.data?.success) {
        const { accessToken } = response.data;
        dispatch(setUserDetails(response?.data?.newUser));
        localStorage.setItem("accessToken", accessToken);
        navigate("/");
      }
    } catch (error: any) {
      if (error?.response) {
        setError(error.response?.data?.message);
      }
      toast.error("Something went wrong.");
      console.log("ERROR IN FORM SUBMISSION", error);
    }
  };

  const resendOTPHandle = async () => {
    try {
      setOtpErrMessage("");
      const response = await axiosInstance.post("/api/users/send-otp", {
        email: formData?.email,
      });
      if (response?.data?.success) {
        toast.success("OTP sent successfully. Please check your email.");
        setOtpMessage("OTP sent successfully. Please check your email.");
        setOtpErrMessage("");
      }
    } catch (error) {
      toast.error("OTP resend failed.");
      console.log(error);
    }
  };

  return (
    <div className="w-full max-w-md ">
      <Toaster />
      <h2 className="text-3xl font-semibold mb-6 text-center">
        Create your account
      </h2>
      {error && (
        <div className="mt-3 text-base text-center text-red-600">{error}</div>
      )}
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4">
            <div className="space-y-2">
              <Field as={Input} type="text" name="name" placeholder="Name" />
              <ErrorMessage
                name="name"
                component="div"
                className="text-red-500 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Field as={Input} type="email" name="email" placeholder="Email" />
              <ErrorMessage
                name="email"
                component="div"
                className="text-red-500 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Field
                as={Input}
                type="tel"
                name="phone"
                placeholder="Phone Number"
              />
              <ErrorMessage
                name="phone"
                component="div"
                className="text-red-500 text-sm"
              />
            </div>
            <div className="space-y-2 relative">
              <Field
                as={Input}
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
              />
              <ErrorMessage
                name="password"
                component="div"
                className="text-red-500 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 pb-3 transform -translate-y-1/2 text-gray-400"
              >
                {showPassword ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </button>
            </div>
            <div className="space-y-2 relative">
              <Field
                as={Input}
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
              />
              <ErrorMessage
                name="confirmPassword"
                component="div"
                className="text-red-500 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 pb-3 transform -translate-y-1/2 text-gray-400"
              >
                {showConfirmPassword ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </button>
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              Sign up
            </Button>
          </Form>
        )}
      </Formik>
      <OTPEnterModal
        isOpen={isOTPModelOpen}
        closeModal={() => setIsOTPModelOpen(false)}
        onSubmit={handleOTPSubmit}
        onResendOTP={resendOTPHandle}
        otpMessage={otpMessage}
        otpErrMessage={otpErrMessage}
      />
      <div className="mt-4">
        <GoogleAuth />
      </div>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
};

export default Signup;
