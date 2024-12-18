import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { baseUrl } from "../../config/baseUrl";

const ResetPasswordPage = () => {
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");

    const userData = { newPassword: newPassword };

    try {
      setError("");

      await axios.post(`${baseUrl}/users/resetPassword/${token}`, userData);

      navigate("/login");
    } catch (err) {
      setError(
        err.response
          ? err.response.data.message
          : "Something went wrong on password reset attempt!"
      );
    }
  };

  return (
    <div className="h-screen flex justify-center items-center">
      <div className="max-w-sm w-full p-10 border-4 border-blue-400 rounded-2xl dark:border-blue-500">
        <h2 className="text-2xl font-bold text-gray-700 mb-4 dark:text-gray-200">
          Reset Password
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="newPassword"
              className="block text-gray-600 mb-1 dark:text-gray-300"
            >
              New password
            </label>
            <input
              type="password"
              id="newPassword"
              className="w-full border border-gray-300 rounded-lg p-2 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="mt-4 w-full bg-blue-500 text-white rounded-lg py-2 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            Confirm
          </button>
        </form>
        {error && <div className="mt-4 text-red-500 text-sm">{error}</div>}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
