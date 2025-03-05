import React from 'react'
import { useSelector } from 'react-redux'
import {Navigate } from 'react-router-dom'



interface RootState {
   admin: {
     adminInfo: any; 
   };
 }

 
const IsAdminLogout = ({children}:{children:React.ReactNode}) => {

 const adminInfo = useSelector((state:RootState)=>state?.admin.adminInfo)
 if(adminInfo){
    //login
    console.log("admin active");
    
    return  <Navigate to={'/admin/dashboard'}/>
 }
 return children
}

export default IsAdminLogout