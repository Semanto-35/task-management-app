import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "../ui/button";


const DarkMode = () => {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);


  return (
    <Button
      size="sm"
      onClick={() => setDarkMode(!darkMode)}
      variant="ghost"
      className="flex items-center gap-2"
    >
      {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
    </Button>
  );
};

export default DarkMode;