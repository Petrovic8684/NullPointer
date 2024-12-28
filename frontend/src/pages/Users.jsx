import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { baseUrl } from "../config/baseUrl";
import useAuth from "../hooks/useAuth";

import Toolbar from "../components/Toolbar";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const { userId, isAuthenticated } = useAuth();

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPage(1);
      fetchUsers({ search: searchQuery, page: 1 });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleScroll = (e) => {
    if (
      window.innerHeight + document.documentElement.scrollTop + 1 >=
      document.documentElement.scrollHeight
    ) {
      setPage((prevPage) => {
        const nextPage = prevPage + 1;
        fetchUsers({ search: searchQuery, page: nextPage });
        return nextPage;
      });
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [searchQuery, page]);

  const fetchUsers = async ({ search = "", page = 1 } = {}) => {
    try {
      const response = await axios.get(`${baseUrl}/users`, {
        params: {
          search,
          page,
          limit: 10,
        },
      });

      if (page === 1) setUsers(response.data.users);
      else setUsers((prevUsers) => [...prevUsers, ...response.data.users]);
    } catch (error) {
      console.error("Error fetching users!", error);
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
          <h1 className="text-3xl font-bold text-gray-700 dark:text-gray-200 mb-4 text-left">
            Users
          </h1>
          <div className="mb-8">
            <input
              type="text"
              placeholder="Search Users by Username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-[43%] p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600"
            />
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {users.map((user) => (
              <div
                key={user._id}
                className="flex items-center gap-x-6 p-6 rounded-lg shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
              >
                <img
                  src={user.image ? user.image : "/unknown.jpg"}
                  width={100}
                  height={100}
                  className="rounded-full object-cover border-2 border-gray-300 dark:border-gray-600"
                  alt=""
                />
                <div className="flex flex-col items-start justify-center">
                  <Link
                    to={`/users/${user._id}`}
                    className="text-2xl font-semibold text-gray-800 dark:text-gray-200 hover:underline"
                  >
                    {user.username}
                  </Link>
                  <p className="text-gray-600 dark:text-gray-400">
                    Reputation:{" "}
                    <span className="font-medium">{user.reputation}</span>
                  </p>
                  {user.isAdmin && (
                    <p className="text-green-600 font-medium dark:text-green-400">
                      Admin
                    </p>
                  )}
                  {user.isBanned && (
                    <p className="text-red-600 font-medium dark:text-red-400">
                      Banned
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default UsersPage;
