import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import DarkMode from "@/components/DarkMode/DarkMode";

const Navbar = () => {
  return (
    <nav className="w-full bg-white shadow-md dark:bg-gray-900 fixed top-0 left-0 z-50">
      <div className="container mx-auto p-4 flex justify-between items-center">
        {/* Logo / Title */}
        <Link to="/" className="text-2xl font-bold text-gray-800 dark:text-white">
          TaskManager
        </Link>

        {/* Navbar Buttons */}
        <div className="flex items-center gap-4">
          <Link to="/login">
            <Button variant="outline">Login</Button>
          </Link>
          <Link to="/signUp">
            <Button>Get Started</Button>
          </Link>
          <DarkMode />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;