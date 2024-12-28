import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { baseUrl } from "../config/baseUrl";
import useAuth from "../hooks/useAuth";

import Toolbar from "../components/Toolbar";
import Question from "../components/Question";

const QuestionsPage = () => {
  const [questions, setQuestions] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    minViews: "",
    maxViews: "",
    updatedAfter: "",
    updatedBefore: "",
    minAnswers: "",
    maxAnswers: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ title: "", body: "" });
  const [showPostNew, setShowPostNew] = useState(false);
  const [error, setError] = useState(null);

  const { isAuthenticated, token, userId, isAdmin, isBanned, loading } =
    useAuth();

  useEffect(() => {
    fetchUsersByReputation();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPage(1);
      fetchQuestions({ search: searchQuery, page: 1 });
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
        fetchQuestions({ search: searchQuery, page: nextPage });
        return nextPage;
      });
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [searchQuery, page]);

  const toggleFilters = () => {
    setShowFilters((prev) => !prev);
  };

  const togglePostNew = () => {
    setError(null);
    setShowPostNew((prev) => !prev);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApplyFilters = () => {
    setQuestions([]);
    setPage(1);
    fetchQuestions();
  };

  const buildQueryParams = (params) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, value);
      }
    });
    return queryParams.toString();
  };

  const handlePostNewQuestion = async () => {
    if (!newQuestion.title) {
      setError("Question title is required!");
      return;
    }

    if (!newQuestion.body) {
      setError("Question body is required!");
      return;
    }

    try {
      if (!token) {
        setError("You must be logged in to post a question!");
        return;
      }

      const response = await axios.post(
        `${baseUrl}/questions`,
        {
          title: newQuestion.title,
          body: newQuestion.body,
          author: userId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setQuestions([response.data, ...questions]);
      setNewQuestion({ title: "", body: "" });

      setError(null);
    } catch (error) {
      setError(
        error.response
          ? error.response.data.message
          : "Something went wrong while submitting your question."
      );
    }
  };

  const fetchQuestions = async ({ search = "", page = 1 } = {}) => {
    try {
      const queryParams = buildQueryParams({
        search,
        page,
        limit: 5,
        ...filters,
      });

      const res = await axios.get(`${baseUrl}/questions?${queryParams}`);

      if (page === 1) setQuestions(res.data.questions);
      else setQuestions((prev) => [...prev, ...res.data.questions]);
    } catch (error) {
      setError(
        error.response
          ? error.response.data.message
          : "Something went wrong while fetching data (questions)!"
      );
    }
  };

  const fetchUsersByReputation = async () => {
    try {
      const res = await axios.get(
        `${baseUrl}/users/byReputation?page=1&limit=10`
      );

      setUsers(res.data.users);
    } catch (error) {
      setError(
        error.response
          ? error.response.data.message
          : "Something went wrong while fetching data (users)!"
      );
    }
  };

  if (!questions || !users || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen dark:bg-gray-800">
        <div className="text-center text-2xl text-gray-700 dark:text-gray-200">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <>
      <Toolbar userId={userId} isAuthenticated={isAuthenticated} />
      <div className="flex flex-row md:mx-20 mx-5 my-24 justify-around">
        <div className="lg:w-3/5 w-full">
          <div className="mb-6">
            <div className="flex lg:hidden justify-between items-center mb-6 ">
              <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                Browse Users
              </h2>
              <Link
                to={"/users"}
                className="text-sm text-blue-600 dark:text-blue-300 hover:underline"
              >
                View
              </Link>
            </div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                Filters
              </h2>
              <button
                onClick={toggleFilters}
                className="text-sm text-blue-600 dark:text-blue-300 hover:underline"
              >
                {showFilters ? "Hide" : "Show"}
              </button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                {/* Minimum Views */}
                <div>
                  <label
                    className="block text-sm text-gray-700 dark:text-gray-200 mb-1 ml-1"
                    htmlFor="minViews"
                  >
                    Minimum Views
                  </label>
                  <input
                    id="minViews"
                    type="number"
                    name="minViews"
                    value={filters.minViews}
                    onChange={handleFilterChange}
                    placeholder="Enter Min Views"
                    className="border p-2 rounded w-full text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                  />
                </div>

                {/* Maximum Views */}
                <div>
                  <label
                    className="block text-sm text-gray-700 dark:text-gray-200 mb-1 ml-1"
                    htmlFor="maxViews"
                  >
                    Maximum Views
                  </label>
                  <input
                    id="maxViews"
                    type="number"
                    name="maxViews"
                    value={filters.maxViews}
                    onChange={handleFilterChange}
                    placeholder="Enter Max Views"
                    className="border p-2 rounded w-full text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                  />
                </div>

                {/* Updated After */}
                <div>
                  <label
                    className="block text-sm text-gray-700 dark:text-gray-200 mb-1 ml-1"
                    htmlFor="updatedAfter"
                  >
                    Updated After
                  </label>
                  <input
                    id="updatedAfter"
                    type="date"
                    name="updatedAfter"
                    value={filters.updatedAfter}
                    onChange={handleFilterChange}
                    placeholder="Select Start Date"
                    className="border p-2 rounded w-full text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                  />
                </div>

                {/* Updated Before */}
                <div>
                  <label
                    className="block text-sm text-gray-700 dark:text-gray-200 mb-1 ml-1"
                    htmlFor="updatedBefore"
                  >
                    Updated Before
                  </label>
                  <input
                    id="updatedBefore"
                    type="date"
                    name="updatedBefore"
                    value={filters.updatedBefore}
                    onChange={handleFilterChange}
                    placeholder="Select End Date"
                    className="border p-2 rounded w-full text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                  />
                </div>

                {/* Minimum Answers */}
                <div>
                  <label
                    className="block text-sm text-gray-700 dark:text-gray-200 mb-1 ml-1"
                    htmlFor="minAnswers"
                  >
                    Minimum Answers
                  </label>
                  <input
                    id="minAnswers"
                    type="number"
                    name="minAnswers"
                    value={filters.minAnswers}
                    onChange={handleFilterChange}
                    placeholder="Enter Min Answers"
                    className="border p-2 rounded w-full text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                  />
                </div>

                {/* Maximum Answers */}
                <div>
                  <label
                    className="block text-sm text-gray-700 dark:text-gray-200 mb-1 ml-1"
                    htmlFor="maxAnswers"
                  >
                    Maximum Answers
                  </label>
                  <input
                    id="maxAnswers"
                    type="number"
                    name="maxAnswers"
                    value={filters.maxAnswers}
                    onChange={handleFilterChange}
                    placeholder="Enter Max Answers"
                    className="border p-2 rounded w-full text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                  />
                </div>
              </div>
            )}

            {showFilters && (
              <button
                onClick={handleApplyFilters}
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                Apply Filters
              </button>
            )}
          </div>
          {isAuthenticated && !isBanned ? (
            <div>
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                  Post a New Question
                </h2>
                <button
                  onClick={togglePostNew}
                  className="text-sm text-blue-600 dark:text-blue-300 hover:underline"
                >
                  {showPostNew ? "Hide" : "Show"}
                </button>
              </div>
              <div>
                {showPostNew ? (
                  <>
                    <div className="mb-4">
                      <input
                        type="text"
                        maxLength={100}
                        placeholder="Enter a Title"
                        value={newQuestion.title}
                        onChange={(e) =>
                          setNewQuestion({
                            ...newQuestion,
                            title: e.target.value,
                          })
                        }
                        className="sm:w-3/5 w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:focus:ring-blue-400 dark:focus:border-blue-400"
                      />
                    </div>

                    <div className="mb-2">
                      <textarea
                        placeholder="Write your question..."
                        value={newQuestion.body}
                        onChange={(e) =>
                          setNewQuestion({
                            ...newQuestion,
                            body: e.target.value,
                          })
                        }
                        className="sm:w-4/5 w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:focus:ring-blue-400 dark:focus:border-blue-400"
                        rows="4"
                      />
                    </div>

                    <div className="mb-3">
                      <button
                        onClick={handlePostNewQuestion}
                        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                      >
                        Ask
                      </button>
                    </div>
                  </>
                ) : (
                  <></>
                )}

                {error && <p className="text-red-500 mb-2">{error}</p>}
              </div>
            </div>
          ) : (
            <></>
          )}
          <h1 className="text-3xl font-bold text-gray-700 dark:text-gray-200 mt-10 mb-4">
            Questions
          </h1>
          <div className="mb-8">
            <input
              type="text"
              placeholder="Search Questions by Title or Body Content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="sm:w-4/5 w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600"
            />
          </div>
          {questions.map((question) => (
            <Question
              key={question._id}
              question={question}
              setQuestions={setQuestions}
              token={token}
              userId={userId}
              isAuthenticated={isAuthenticated}
              isAdmin={isAdmin}
              isBanned={isBanned}
              showAuthor={true}
              align={"left"}
            />
          ))}
        </div>

        <div className="w-1/6 h-full hidden lg:block text-center">
          {" "}
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">
            Top Users
          </h2>
          <div className="mb-4">
            {users.map((user) => (
              <div
                key={user._id}
                className="border-b border-gray-300 dark:border-gray-600 py-2"
              >
                <Link
                  to={`/users/${user._id}`}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {user.username}
                </Link>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Reputation: {user.reputation}
                </p>
              </div>
            ))}
          </div>
          <Link
            to={"/users"}
            className="text-sm text-gray-500 dark:text-gray-400 hover:underline"
          >
            View All
          </Link>
        </div>
      </div>
    </>
  );
};

export default QuestionsPage;
