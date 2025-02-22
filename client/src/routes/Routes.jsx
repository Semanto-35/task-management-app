import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Home from "@/pages/Home/Home";
import Login from "@/pages/Login/Login";
import SignUp from "@/pages/SignUp/SignUp";








const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <div>404 Not Found</div>,
    children: [
      { path: "/", element: <Home /> },
      { path: "/login", element: <Login /> },
      { path: "/signUp", element: <SignUp /> },
    ],
  },
]);

export default router;