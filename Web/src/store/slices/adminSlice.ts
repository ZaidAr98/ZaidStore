import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    adminInfo:localStorage.getItem("adminInfo")?JSON.parse(localStorage.getItem("adminInfo") as string):null
}


const adminSlice = createSlice({
    name:"admin",
    initialState,
    reducers:{
        setadminDetails:(state,action)=>{
            state.adminInfo = action.payload;
            localStorage.setItem("adminInfo",JSON.stringify(action.payload))
        },

       logoutadmin:(state)=>{
        state.adminInfo = null
        localStorage.removeItem("adminInfo")
       }
    }
})



export const {setadminDetails,logoutadmin} = adminSlice.actions

export default adminSlice.reducer