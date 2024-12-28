import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiLogOut, FiMoon, FiSun, FiUser } from "react-icons/fi";
import { FaArrowTrendUp } from "react-icons/fa6";
import useDarkMode from "../hooks/useDarkMode";

const Toolbar = ({ isAuthenticated, userId }) => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    navigate("/");
  };

  const handleUserRedirect = () => {
    navigate(`/users/${userId}`);
  };

  return (
    <div className="fixed top-0 left-0 w-full bg-gray-100 dark:bg-gray-800 p-2 shadow-gray-300 dark:shadow-gray-900 shadow-md flex items-center justify-between z-50">
      <div className="flex text-lg font-bold text-gray-600 dark:text-gray-200 md:ml-32 ml-3">
        <FaArrowTrendUp
          size={24}
          className="text-blue-500 dark:text-blue-300"
        />
        <Link to={isAuthenticated ? "/questions" : "/"}>
          <p className="ml-2">NullPointer</p>
        </Link>
      </div>
      <div className="flex items-center space-x-4 md:mr-32 mr-3">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-full"
        >
          {isDarkMode ? <FiSun size={24} /> : <FiMoon size={24} />}
        </button>

        {isAuthenticated ? (
          <>
            <button
              onClick={handleUserRedirect}
              className="p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-full"
            >
              <FiUser size={24} />
            </button>

            <button
              onClick={handleLogout}
              className="p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-full"
            >
              <FiLogOut size={24} />
            </button>
          </>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};

export default Toolbar;
