import React from 'react'
import { useSelector } from 'react-redux'
import { useNavigate,Navigate } from 'react-router-dom'

interface RootState {
    user: {
      userInfo: any; 
    };
}


const IsUserLogin = ({children}:{children:React.ReactNode}) => {
   
const userInfo =useSelector((state:RootState)=>state?.user?.userInfo)
if(!userInfo){
    return <Navigate to={'/login'}/>
}
return children
}

export default IsUserLogin