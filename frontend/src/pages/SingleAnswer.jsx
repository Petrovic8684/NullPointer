import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { baseUrl } from "../config/baseUrl";
import useAuth from "../hooks/useAuth";

import Toolbar from "../components/Toolbar";
import Answer from "../components/Answer";

const SingleAnswerPage = () => {
  const { id } = useParams();
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState(null);

  const { isAuthenticated, token, userId, isAdmin, isBanned, loading } =
    useAuth();

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const answerRes = await axios.get(`${baseUrl}/answers/${id}`);

      setAnswer(answerRes.data);
    } catch (err) {
      setError(
        err.response
          ? err.response.data.message
          : "Something went wrong while fetching data!"
      );
    }
  };

  if (!answer || loading) {
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
      <div className="md:mx-20 mx-5 my-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-blue-500 mb-12 dark:text-blue-400">
            {answer.question.title}
          </h1>
          <Answer
            answer={answer}
            setAnswer={setAnswer}
            token={token}
            userId={userId}
            isAuthenticated={isAuthenticated}
            isAdmin={isAdmin}
            isBanned={isBanned}
            clickable={false}
            showAuthor={true}
          />
          {error && <p className="text-red-500 mt-4">{error}</p>}

          {/* Votes Section */}
          <div className="mt-12 p-6 bg-gray-50 dark:bg-gray-800 rounded shadow dark:shadow-gray-900">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
              Votes
            </h2>
            {answer.userVotes.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">
                No votes have been cast on this answer.
              </p>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {answer.userVotes.map((vote) => (
                  <li
                    key={vote._id}
                    className="py-3 flex justify-between items-center"
                  >
                    <div>
                      <a
                        href={`/users/${vote.user._id}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {vote.user.username}
                      </a>
                    </div>
                    <div
                      className={`text-sm font-medium ${
                        vote.vote === "upvote"
                          ? "text-green-600 dark:text-green-500"
                          : "text-red-600 dark:text-red-500"
                      }`}
                    >
                      {vote.vote === "upvote" ? "Upvote" : "Downvote"}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SingleAnswerPage;
