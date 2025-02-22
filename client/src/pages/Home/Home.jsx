import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-center px-4 pt-[68px]">
      <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-6">
        Manage Your Tasks Efficiently
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl">
        Stay organized and boost your productivity with TaskManager. Plan, track, and complete tasks effortlessly.
      </p>

      {/* Get Started Button */}
      <Link to="/signUp">
        <Button size="lg">Get Started</Button>
      </Link>
    </div>
  );
};

export default Home;