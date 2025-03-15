import store from "@/store/store";
import { logoutUser } from "@/store/slices/userSlice";
import { logoutadmin } from "@/store/slices/adminSlice";
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

interface ErrorResponse {
  error: string;
}

interface RefreshTokenResponse {
  accessToken: string;
}


interface RefreshAdminTokenResponse {
    adminAccessToken: string;
  }

// const apiUrl = import.meta.env.VITE_API_URL as string;
const apiUrl = "http://localhost:8000";

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("accessToken");
    console.log("accesstok", token);

    if (token) {
      config.headers = config.headers || {};
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },

  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log("refresh response", response);
    return response;
  },

  async (error: AxiosError<ErrorResponse>) => {
    console.log("error", error);

    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response) {
      if (
        error.response.status === 401 &&
        error.response.data.error === "invalid token" &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;
        console.log("retrying request");

        try {
          console.log("attempting to refresh token");
          console.log("refreshToken from cookie");

          const refreshResponse: AxiosResponse<RefreshTokenResponse> =
            await axiosInstance.post("/api/users/refresh-token");
          console.log(
            "access token refreshed refresh response;-",
            refreshResponse
          );
          const newAccessToken: string = refreshResponse.data.accessToken;

          if (newAccessToken) {
            localStorage.setItem("accessToken", newAccessToken); //store new token

            console.log("new access token", newAccessToken);

            //update autorization header with new token
            axiosInstance.defaults.headers.common[
              "Authorization"
            ] = `Bearer ${newAccessToken}`;

            //retry the original request with new token
            return axiosInstance(originalRequest);
          }
        } catch (refreshErrot) {
          console.log("redirecting user to home page");
          localStorage.removeItem("accessToken");
          store.dispatch(logoutUser());
          window.location.href = "/login";
          throw new Error("Session expired. Redirecting to login.");
        }
      }
    }

    return Promise.reject(error);
  }
);


export const adminAxiosInstance =axios.create({
    baseURL:apiUrl,
    withCredentials: true
  })
  

adminAxiosInstance.interceptors.response.use((response)=>{
    console.log("admin refresh response",response);
    return response
  },
  async(error)=>{
    const originalRequest=error.config;
    if(error.response){
      if(error.response.status===401 && error.response.data.error==='Invalid access token' && !originalRequest._retry){
        originalRequest._retry=true;
        console.log("rerying req");
        try {
          const refreshResponse=await adminAxiosInstance.post('/api/admin/refresh-token')
          const newAccessToken= refreshResponse.data.adminAccessToken
          if(newAccessToken){
            localStorage.setItem("adminAccessToken",newAccessToken)
            console.log("new access token");
  
            adminAxiosInstance.defaults.headers.common['Authorization']=`Bearer ${newAccessToken}`  
            return adminAxiosInstance(originalRequest);      }
        } catch (error) {
          localStorage.removeItem("adminAccessToken")
          store.dispatch(logoutadmin())
          console.log("session expired",error);
          window.location.href = "/admin";
         
          
            throw new Error("Session expired. Redirecting to login.");
        }
      }
    }
    return Promise.reject(error);
  })



  adminAxiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig)=>{
      const token =localStorage.getItem("adminAccessToken")
      if(token){
        config.headers['Authorization']=`Bearer ${token}`
      }
      return config;
    },
    (error:AxiosError)=>{
      return Promise.reject(error)
    }
  )



  adminAxiosInstance.interceptors.response.use((response: AxiosResponse)=>{
    console.log("admin refresh response",response);
    return response
  },
  async(error: AxiosError<ErrorResponse>)=>{
    const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };
  
    if(error.response){
      if(error.response.status===401 && error.response.data.error==='Invalid access token' && !originalRequest._retry){
        originalRequest._retry=true;
        console.log("rerying req");
        try {
          const refreshResponse : AxiosResponse<RefreshAdminTokenResponse> =await adminAxiosInstance.post('/api/admin/refresh-token')
          const newAccessToken= refreshResponse.data.adminAccessToken
          if(newAccessToken){
            localStorage.setItem("adminAccessToken",newAccessToken)
            console.log("new access token");
  
            adminAxiosInstance.defaults.headers.common['Authorization']=`Bearer ${newAccessToken}`  
            return adminAxiosInstance(originalRequest);      }
        } catch (error) {
          localStorage.removeItem("adminAccessToken")
          store.dispatch(logoutadmin())
          console.log("session expired",error);
          window.location.href = "/admin";
         
          
            throw new Error("Session expired. Redirecting to login.");
        }
      }
    }
    return Promise.reject(error);
  })