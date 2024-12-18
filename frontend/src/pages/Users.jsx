import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { baseUrl } from "../config/baseUrl";
import useAuth from "../hooks/useAuth";

import Toolbar from "../components/Toolbar";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);

  const { isAuthenticated, userId } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const handleScroll = (e) => {
    if (
      window.innerHeight + document.documentElement.scrollTop + 1 >=
      document.documentElement.scrollHeight
    ) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        `${baseUrl}/users?page=${page}&limit=10`
      );

      setUsers((prevUsers) => [...prevUsers, ...response.data.users]);
    } catch (error) {
      console.error("Error fetching users: ", error);
    }
  };

  if (!users) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <Toolbar userId={userId} isAuthenticated={isAuthenticated} />

      <div className="md:mx-20 mx-5 my-24">
        <div className="max-w-4xl mx-auto my-10">
          <h1 className="text-3xl font-bold text-gray-700 dark:text-gray-200 mb-4">
            Users
          </h1>
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user._id}
                className="border-b border-gray-300 dark:border-gray-600 py-2"
              >
                <Link
                  to={`/users/${user._id}`}
                  className="text-lg text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {user.username}
                </Link>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Reputation: {user.reputation}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default UsersPage;
