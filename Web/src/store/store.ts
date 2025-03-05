import { configureStore } from "@reduxjs/toolkit";

import adminSlice from './slices/adminSlice'
import userSlice from './slices/userSlice'
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";


const store=configureStore({
    reducer:{
        user:userSlice,
        admin:adminSlice
    },
    devTools:true
})
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch



export const useAppDispatch = () => useDispatch<AppDispatch>() 
export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector 


export default store