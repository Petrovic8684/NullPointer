import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { FaArrowTrendUp } from "react-icons/fa6";

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState();

  useEffect(() => {
    setIsLoggedIn(isAuthenticated);
  }, [isAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    setIsLoggedIn(false);
  };

  return (
    <div className="h-screen flex flex-col justify-center items-center md:mx-20 mx-5">
      <FaArrowTrendUp
        size={100}
        className="text-blue-600 dark:text-blue-400 text-bold"
      />
      <h1 className="text-4xl text-center font-bold text-blue-600 mb-4 dark:text-blue-400">
        Welcome to NullPointer!
      </h1>
      <p className="text-gray-700 mb-6 text-center max-w-md dark:text-gray-300">
        Explore ideas, share your knowledge, and collaborate with a vibrant
        community.
      </p>
      <div className="flex gap-4">
        <Link
          to="/questions"
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
        >
          Browse Questions
        </Link>
        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Logout
          </button>
        ) : (
          <Link
            to="/login"
            className="px-6 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Login
          </Link>
        )}
      </div>
    </div>
  );
};

export default LandingPage;
