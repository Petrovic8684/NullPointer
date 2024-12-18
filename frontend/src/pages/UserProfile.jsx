import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { baseUrl } from "../config/baseUrl";
import useAuth from "../hooks/useAuth";

import Toolbar from "../components/Toolbar";
import Answer from "../components/Answer";
import Question from "../components/Question";

const UserProfilePage = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [toggleView, setToggleView] = useState("questions");
  const [pageQuestions, setPageQuestions] = useState(1);
  const [pageAnswers, setPageAnswers] = useState(1);

  const { isAuthenticated, token, userId, isAdmin, isBanned, loading } =
    useAuth();

  useEffect(() => {
    fetchUserData();
  }, [id]);

  useEffect(() => {
    fetchQuestions();
  }, [pageQuestions, id]);

  useEffect(() => {
    fetchAnswers();
  }, [pageAnswers, id]);

  const handleScroll = (e) => {
    if (
      window.innerHeight + e.target.documentElement.scrollTop + 1 >=
      e.target.documentElement.scrollHeight
    ) {
      toggleView === "questions"
        ? setPageQuestions((prev) => prev + 1)
        : setPageAnswers((prev) => prev + 1);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [toggleView]);

  const fetchUserData = async () => {
    try {
      const userRes = await axios.get(`${baseUrl}/users/${id}`);
      setUser(userRes.data);
    } catch (error) {
      console.error("Error fetching user data: ", error);
    }
  };

  const fetchQuestions = async () => {
    try {
      const questionsRes = await axios.get(
        `${baseUrl}/questions/byUser/${id}?limit=5&page=${pageQuestions}`
      );
      setQuestions((prev) => [...prev, ...questionsRes.data.questions]);
    } catch (error) {
      console.error("Error fetching questions: ", error);
    }
  };

  const fetchAnswers = async () => {
    try {
      const answersRes = await axios.get(
        `${baseUrl}/answers/byUser/${id}?limit=5&page=${pageAnswers}`
      );
      setAnswers((prev) => [...prev, ...answersRes.data.answers]);
    } catch (error) {
      console.error("Error fetching answers: ", error);
    }
  };

  const toggleContent = (view) => {
    setToggleView(view);
  };

  const handleBanUnban = async () => {
    try {
      const action = user.isBanned ? "unban" : "ban";
      await axios.put(
        `${baseUrl}/users/${id}/${action}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUser({ ...user, isBanned: !user.isBanned });
    } catch (error) {
      console.error("Error performing ban/unban: ", error);
    }
  };

  const handlePromote = async () => {
    try {
      await axios.put(
        `${baseUrl}/users/${id}/promote`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUser({ ...user, isAdmin: true });
    } catch (error) {
      console.error("Error promoting user: ", error);
    }
  };

  if (!user || !questions || !answers || loading)
    return (
      <div className="flex items-center justify-center min-h-screen dark:bg-gray-800">
        <div className="text-center text-2xl text-gray-700 dark:text-gray-200">
          Loading...
        </div>
      </div>
    );

  return (
    <>
      <Toolbar userId={userId} isAuthenticated={isAuthenticated} />
      <div className="md:mx-20 mx-5 my-24">
        <div className="max-w-4xl mx-auto">
          {/* User Info Section */}
          <div className="flex flex-col items-center bg-white p-6 shadow-lg shadow-gray-200 dark:shadow-gray-900 rounded-lg border dark:bg-gray-800 dark:border-gray-700">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
              {user.username}
            </h1>
            <p className="text-gray-600 text-lg mt-2 dark:text-gray-300">
              Reputation: {user.reputation}
            </p>
            {user.isAdmin ? (
              <p className="mt-1 text-green-600 font-medium dark:text-green-400">
                Admin
              </p>
            ) : user.isBanned ? (
              <p className="mt-1 text-red-600 font-medium dark:text-red-400">
                Banned
              </p>
            ) : null}

            {/* Admin Actions */}
            {isAdmin && !user.isAdmin && (
              <div className="mt-6 flex space-x-4">
                {!user.isBanned && (
                  <button
                    onClick={handlePromote}
                    className="px-4 py-2 bg-green-500 text-white rounded shadow hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
                  >
                    Promote User
                  </button>
                )}
                <button
                  onClick={handleBanUnban}
                  className={`px-4 py-2 text-white rounded shadow ${
                    user.isBanned
                      ? "bg-yellow-400 hover:bg-yellow-500 dark:bg-yellow-500 dark:hover:bg-yellow-600"
                      : "bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
                  }`}
                >
                  {user.isBanned ? "Unban User" : "Ban User"}
                </button>
              </div>
            )}
          </div>

          {/* Toggle Radiobuttons */}
          <div className="mt-8 flex justify-center space-x-8">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="view"
                value="questions"
                checked={toggleView === "questions"}
                onChange={() => toggleContent("questions")}
                className="form-radio text-blue-600 dark:text-blue-400"
              />
              <span className="text-lg text-gray-800 dark:text-gray-200">
                Questions
              </span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="view"
                value="answers"
                checked={toggleView === "answers"}
                onChange={() => toggleContent("answers")}
                className="form-radio text-blue-600 dark:text-blue-400"
              />
              <span className="text-lg text-gray-800 dark:text-gray-200">
                Answers
              </span>
            </label>
          </div>

          {/* Content Section */}
          <div className="mt-10 space-y-6 w-4/5 mx-auto">
            {toggleView === "questions" &&
              (questions.length === 0 ? (
                <p className="text-gray-500 text-center dark:text-gray-400">
                  This user hasn't asked any questions yet!
                </p>
              ) : (
                questions.map((question) => (
                  <Question
                    key={question._id}
                    question={question}
                    setQuestions={setQuestions}
                    token={token}
                    userId={userId}
                    isAuthenticated={isAuthenticated}
                    isAdmin={isAdmin}
                    isBanned={isBanned}
                    showAuthor={false}
                    align={"center"}
                  />
                ))
              ))}

            {toggleView === "answers" &&
              (answers.length === 0 ? (
                <p className="text-gray-500 text-center dark:text-gray-400">
                  This user hasn't posted any answers yet!
                </p>
              ) : (
                answers.map((answer) => (
                  <Answer
                    key={answer._id}
                    answer={answer}
                    setAnswers={setAnswers}
                    token={token}
                    userId={userId}
                    isAuthenticated={isAuthenticated}
                    isAdmin={isAdmin}
                    isBanned={isBanned}
                    clickable={true}
                    showAuthor={false}
                    setUser={setUser}
                  />
                ))
              ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default UserProfilePage;
