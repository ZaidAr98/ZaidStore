import { Suspense, lazy } from "react";
import "./App.css";

const UserSignup = lazy(() => import("./pages/user/auth/UserSignup"));
const ForgetPasswordPage = lazy(() => import("./pages/user/auth/ForgetPasswordPge"));

// const UserLogin = lazy(() => import("./pages/user/auth/UserLogin"));
// const AdminLoginPage = lazy(() => import("./pages/admin/AdminLoginPage"));

// Import protection components normally since they're lightweight
import IsAdminLogin from "./store/protect/isAdminLogin";
import IsAdminLogout from "./store/protect/isAdminLogout";
import IsUserLogout from "./store/protect/isUserLogout";
import IsUserLogin from "./store/protect/isUserLogin";
import { Route, Routes } from "react-router-dom";
import UserPage from "./pages/user/auth/UserPage";
import UserLogin from "./pages/user/auth/UserLogin";
import AdminLoginPage from "./pages/admin/auth/AdminLoginPage";
import AddProduct from "./components/products/AddProduct";
import EditProduct from "./components/products/EditProduct";


function App() {
  return (
    <>
      <Routes>
        <Route
          path="/login"
          element={
            <IsUserLogout>
              <UserLogin />
            </IsUserLogout>
          }
        />

        <Route
          path="/signup"
          element={
            <IsUserLogout>
              <UserSignup />
            </IsUserLogout>
          }
        />

        <Route
          path="/forget-password"
          element={
            <IsUserLogout>
              <ForgetPasswordPage />
            </IsUserLogout>
          }
        />

        <Route
          path="/admin"
          element={
            <IsUserLogout>
              <AdminLoginPage />
            </IsUserLogout>
          }
        />
   <Route
            path="/admin/product/add"
            element={
              <IsAdminLogin>
                <AddProduct />
              </IsAdminLogin>
            }
          ></Route>
   <Route
            path="/admin/product/edit/:productId"
            element={
              <IsAdminLogin>
                <EditProduct />
              </IsAdminLogin>
            }
          ></Route>
        <Route
          path="/UserPage"
          element={
            <IsUserLogin>
              <UserPage />
            </IsUserLogin>
          }
        />
      </Routes>
    </>
  );
}

export default App;
