import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { baseUrl } from "../../config/baseUrl";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userData = { email: email, password: password };

    try {
      setError("");

      const response = await axios.post(`${baseUrl}/users/login`, userData);
      localStorage.setItem("token", response.data.token);
      navigate("/questions");
    } catch (err) {
      setError(
        err.response
          ? err.response.data.message
          : "Something went wrong on login attempt!"
      );
    }
  };

  const handleSendPasswordResetEmail = async (e) => {
    e.preventDefault();

    const userData = { email: email };

    try {
      setError("");

      await axios.post(`${baseUrl}/users/forgotPassword`, userData);

      navigate("/forgot-password");
    } catch (err) {
      setError(
        err.response
          ? err.response.data.message
          : "Something went wrong on password reset attempt!"
      );
    }
  };

  return (
    <div className="h-screen flex justify-center items-center md:mx-20 mx-5">
      <div className="max-w-sm w-full p-10 md:border-4 border-2 border-blue-400 rounded-2xl dark:border-blue-500">
        <h2 className="text-2xl font-bold text-gray-700 mb-4 dark:text-gray-200">
          Login
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-gray-600 mb-1 dark:text-gray-300"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full border border-gray-300 rounded-lg p-2 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-gray-600 mb-1 dark:text-gray-300"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full border border-gray-300 rounded-lg p-2 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="mt-4 w-full bg-blue-500 text-white rounded-lg py-2 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            Submit
          </button>
        </form>
        <div className="mt-4 flex justify-between items-center text-sm">
          <Link
            to="/register"
            className="text-blue-500 hover:underline dark:text-blue-400 dark:hover:text-blue-500"
          >
            Register
          </Link>
          <span
            onClick={handleSendPasswordResetEmail}
            className="text-gray-500 hover:underline cursor-pointer dark:text-gray-400 dark:hover:text-gray-300"
          >
            Forgot password?
          </span>
        </div>
        {error && <div className="mt-4 text-red-500 text-sm">{error}</div>}
      </div>
    </div>
  );
};

export default LoginPage;
