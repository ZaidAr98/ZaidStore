
import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";


export interface RootState {
    admin: {
      adminInfo: any; 
    };
  }

const IsAdminLogin = ({children}:{children:React.ReactNode}) =>{

    
    const adminInfo = useSelector((state:RootState)=>state?.admin?.adminInfo)
    if(!adminInfo){
        return <Navigate to={'/admin'}/>
    }
    return children
}


export default IsAdminLogin