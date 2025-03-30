import { Suspense, lazy } from "react";
import "./App.css";

const UserSignup = lazy(() => import("./pages/user/auth/UserSignup"));
const ForgetPasswordPage = lazy(
  () => import("./pages/user/auth/ForgetPasswordPge")
);

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
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AddProduct from "./components/admin/products/AddProduct";
import EditProduct from "./components/admin/products/EditProduct";
import EditCategory from "./components/admin/categories/EditCategory";
import AddCategory from "./components/admin/categories/AddCategory";
import Categories from "./components/admin/categories/Categories";
import Products from "./components/admin/products/Products";
import DashboardLayout from "./pages/admin/DashboardLayout";

function App() {
  return (
    <>
      <Routes>
        {/* <Route path="/" element={<LandingPage />} /> */}
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
          path="/admin/dashboard"
          element={
            <IsAdminLogin>
              <DashboardLayout />
            </IsAdminLogin>
          }
        >
          {/* <Route index element={<Dashboard/>} /> */}
          <Route path="products" element={<Products />} />
          <Route path="products/add" element={<AddProduct />} />
          <Route path="products/edit" element={<EditProduct />} />
          <Route path="categories" element={<Categories />} />
          <Route path="categories/add" element={<AddCategory />} />
          <Route path="categories/edit" element={<EditCategory />} />
        </Route>
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
