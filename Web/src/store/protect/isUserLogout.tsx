import React from 'react'
import { useSelector } from 'react-redux'
import { useNavigate,Navigate } from 'react-router-dom'


interface RootState {
    user: {
      userInfo: any; 
    };
  }
 


const IsUserLogout = ({children}:{children:React.ReactNode}) => {
 
 const userInfo = useSelector((state:RootState)=>state?.user.userInfo)
 if(userInfo){
    //login
    console.log("admin active");
    
    return  <Navigate to={'/'}/>
 }
 return children
}

export default IsUserLogout