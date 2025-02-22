import Navbar from "@/pages/Home/Navbar";
import { Outlet } from "react-router-dom";


const MainLayout = () => {
  return (
    <div>
      <Navbar />
      <main className="max-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;