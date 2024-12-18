import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { baseUrl } from "../config/baseUrl";
import useAuth from "../hooks/useAuth";

import Toolbar from "../components/Toolbar";
import Answer from "../components/Answer";

const SingleQuestionPage = () => {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [newAnswer, setNewAnswer] = useState("");
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  const { isAuthenticated, token, userId, isAdmin, isBanned, loading } =
    useAuth();

  useEffect(() => {
    increaseViewCount();
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [page]);

  const handleScroll = (e) => {
    if (
      window.innerHeight + e.target.documentElement.scrollTop + 1 >=
      e.target.documentElement.scrollHeight
    ) {
      setPage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchData = async () => {
    try {
      const questionRes = await axios.get(`${baseUrl}/questions/${id}`);
      setQuestion(questionRes.data);

      const answersRes = await axios.get(
        `${baseUrl}/answers/byQuestion/${id}?limit=5&page=${page}`
      );

      setAnswers((prev) => [...prev, ...answersRes.data.answers]);
    } catch (error) {
      setError(
        error.response
          ? error.response.data.message
          : "Something went wrong while fetching data (answers)!"
      );
    }
  };

  const increaseViewCount = async () => {
    try {
      await axios.post(`${baseUrl}/questions/${id}/viewed`);
    } catch (error) {
      setError(
        error.response
          ? error.response.data.message
          : "Something went wrong while updating view count on question!"
      );
    }
  };

  const handleAddAnswer = async () => {
    if (!newAnswer) {
      setError("Answer body is required!");
      return;
    }

    try {
      if (!token) {
        setError("You must be logged in to answer a question!");
        return;
      }

      const res = await axios.post(
        `${baseUrl}/answers`,
        {
          body: newAnswer,
          questionId: id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAnswers((prev) => [res.data, ...prev]);
      setNewAnswer("");
      setError(null);
    } catch (error) {
      setError(
        error.response
          ? error.response.data.message
          : "Something went wrong while submitting your answer!"
      );
    }
  };

  if (!question || !answers || loading) {
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
      <div className="md:mx-20 mx-5 my-24  dark:text-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-blue-500 mb-2 dark:text-blue-400">
              {question.title}
            </h1>
            <p className="text-gray-700 mb-4 dark:text-gray-300">
              {question.body}
            </p>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <span>Posted by: </span>
              <a
                href={`/users/${question.author._id}`}
                className="ml-2 text-blue-600 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
              >
                {question.author.username}
              </a>
              <span className="ml-4">
                {new Date(question.createdAt).toLocaleString()}
              </span>
            </div>
          </div>

          {isAuthenticated && !isBanned ? (
            <div className="mb-3">
              <textarea
                className="w-full border rounded p-2 text-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 resize-none"
                placeholder="Write your answer..."
                rows="3"
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
              ></textarea>
              <button
                onClick={handleAddAnswer}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400"
              >
                Answer
              </button>
            </div>
          ) : null}

          {error ? (
            <p className="text-red-500 mb-8">{error}</p>
          ) : (
            <div className="mb-8"></div>
          )}

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200">
              Answers
            </h2>
            {answers.length === 0 ? (
              isAuthenticated ? (
                <p className="text-gray-500 dark:text-gray-400">
                  No answers yet. Be the first to answer!
                </p>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  No answers yet. Login to be the first to answer!
                </p>
              )
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
                  showAuthor={true}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SingleQuestionPage;
