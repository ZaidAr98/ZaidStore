import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { axiosInstance } from '../../../config/axiosConfig';
import { useAppDispatch } from '../../../store/store';
import { setUserDetails } from '@/store/slices/userSlice';
import { useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

function GoogleAuth() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleError = () => {
    console.log("error in google auth");
  };

  const handleSuccess = async (response: any) => {
    const { credential } = response;

    try {
      const result = await axiosInstance.post('/api/users/google-auth', {
        token: credential,
      });

      if (result.data.success) {
        const { accessToken } = result.data;
        dispatch(setUserDetails(result.data.user));
        localStorage.setItem('accessToken', accessToken);
        navigate('/');
      }
      console.log('Sign in with google success');
    } catch (error: any) {
      console.log('Sign in with google error', error);
    }
  };

  return (
    <div className="flex justify-center">
      <Toaster />
      <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
    </div>
  );
}

export default GoogleAuth;