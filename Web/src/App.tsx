import { Suspense, lazy } from "react";
import "./App.css";

const UserSignup = lazy(() => import("./pages/user/auth/UserSignup"));
// const UserLogin = lazy(() => import("./pages/user/auth/UserLogin"));
// const AdminLoginPage = lazy(() => import("./pages/admin/AdminLoginPage"));

// Import protection components normally since they're lightweight
import IsAdminLogin from "./store/protect/isAdminLogin";
import IsAdminLogout from "./store/protect/isAdminLogout"
import IsUserLogout from "./store/protect/isUserLogout";
import IsUserLogin from "./store/protect/isUserLogin";
import { Route, Routes } from "react-router-dom";
import AdminPage from "./pages/user/auth/AdminPage";
import UserPage from "./pages/user/auth/UserPage";

function App() {
  return (
    <>
      <Routes>
        {/* <Route
          path="/login"
          element={
            <IsUserLogout>
              <UserLogin />
            </IsUserLogout>
          }
        /> */}

        <Route
          path="/signup"
          element={
            <IsUserLogout>
              <UserSignup />
            </IsUserLogout>
          }
        />

        {/* <Route
          path="/admin"
          element={
            <IsAdminLogout>
              <AdminLoginPage />
            </IsAdminLogout>
          }
        /> */}

        <Route
          path="/adminPage"
          element={
            <IsAdminLogin>
              <AdminPage />
            </IsAdminLogin>
          }
        />

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

