import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { baseUrl } from "../config/baseUrl";
import { FaEdit, FaTrashAlt } from "react-icons/fa";

const Answer = ({
  answer,
  setAnswer,
  setAnswers,
  token,
  userId,
  isAuthenticated,
  isAdmin,
  isBanned,
  clickable,
  showAuthor,
  setUser,
}) => {
  const [totalScore, setTotalScore] = useState(null);
  const [vote, setVote] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editedBody, setEditedBody] = useState(answer.body);

  const navigate = useNavigate();

  useEffect(() => {
    setTotalScore(answer.totalVoteScore);
    setVote(
      answer.userVotes.some(
        (vote) => vote.user._id === userId && vote.vote === "upvote"
      )
        ? "upvote"
        : answer.userVotes.some(
            (vote) => vote.user._id === userId && vote.vote === "downvote"
          )
        ? "downvote"
        : null
    );
  }, [answer]);

  const handleVote = async (vote) => {
    try {
      const response = await axios.post(
        `${baseUrl}:${import.meta.env.VITE_BACKEND_PORT}/answers/${
          answer._id
        }/vote`,
        { vote },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTotalScore(response.data.answer.totalVoteScore);
      setVote(
        response.data.answer.userVotes.some(
          (vote) => vote.user._id === userId && vote.vote === "upvote"
        )
          ? "upvote"
          : response.data.answer.userVotes.some(
              (vote) => vote.user._id === userId && vote.vote === "downvote"
            )
          ? "downvote"
          : null
      );

      if (setUser) {
        setUser((prevUser) => ({
          ...prevUser,
          reputation: response.data.newUserReputation,
        }));
      }

      if (!setAnswer) return;

      setAnswer((prevAnswer) => ({
        ...prevAnswer,
        totalVoteScore: response.data.answer.totalVoteScore,
        userVotes: response.data.answer.userVotes,
      }));
    } catch (error) {
      console.error("Error voting on answer: ", error);
    }
  };

  const handleEditSubmit = async () => {
    try {
      const response = await axios.put(
        `${baseUrl}:${import.meta.env.VITE_BACKEND_PORT}/answers/${answer._id}`,
        { body: editedBody },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!setAnswers) {
        setAnswer((prevAnswer) => ({
          ...prevAnswer,
          body: response.data.body,
          updatedAt: new Date(response.data.updatedAt),
        }));

        setIsEditing(false);
        return;
      }

      setAnswers((prevAnswers) =>
        prevAnswers.map((answer) =>
          answer._id === response.data._id
            ? {
                ...answer,
                body: response.data.body,
                updatedAt: new Date(response.data.updatedAt),
              }
            : answer
        )
      );

      setIsEditing(false);
    } catch (error) {
      console.error("Error editing the answer: ", error);
    }
  };

  const handleCancel = () => {
    setEditedBody(answer.body);
    setIsEditing(false);
  };

  const handleDelete = async (answerId) => {
    try {
      await axios.delete(
        `${baseUrl}:${import.meta.env.VITE_BACKEND_PORT}/answers/${answerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!setAnswers) {
        navigate(-1);
        return;
      }

      setAnswers((prevAnswers) =>
        prevAnswers.filter((answer) => answer._id !== answerId)
      );
    } catch (error) {
      console.error("Error deleting the answer: ", error);
    }
  };

  const handleDeleteClick = async () => {
    if (window.confirm("Are you sure you want to delete this answer?")) {
      await handleDelete(answer._id);
    }
  };

  if (!answer) {
    return (
      <div className="text-gray-500 dark:text-gray-400 mb-4">Loading...</div>
    );
  }

  return (
    <div className="p-4 bg-white border rounded shadow-sm dark:bg-gray-800 dark:border-gray-700 flex items-center">
      {/* Voting Section */}
      {isAuthenticated &&
        !isBanned &&
        (answer.author._id ? answer.author._id : answer.author) != userId && (
          <div className="flex flex-col items-center justify-center mr-4">
            <button
              onClick={() => handleVote("upvote")}
              className={
                vote === "upvote"
                  ? "text-green-500"
                  : "text-gray-400 hover:text-green-500"
              }
            >
              ▲
            </button>
            <span className="text-gray-700 dark:text-gray-200 font-bold">
              {totalScore}
            </span>
            <button
              onClick={() => handleVote("downvote")}
              className={
                vote === "downvote"
                  ? "text-red-500"
                  : "text-gray-400 hover:text-red-500"
              }
            >
              ▼
            </button>
          </div>
        )}

      <div className="flex-1 mb-1">
        <div>
          {isEditing ? (
            <textarea
              value={editedBody}
              onChange={(e) => setEditedBody(e.target.value)}
              className="text-justify w-full p-2 border border-gray-300 rounded dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 resize-none"
            />
          ) : clickable ? (
            <Link to={`/answers/${answer._id}`}>
              <p className="text-gray-700 text-justify dark:text-gray-200 hover:underline">
                {answer.body}
              </p>
            </Link>
          ) : (
            <p className="text-gray-700 text-justify dark:text-gray-200">
              {answer.body}
            </p>
          )}

          <div className="flex items-center text-sm text-gray-500 mt-2 dark:text-gray-400">
            {showAuthor ? (
              <>
                <span>Posted by: </span>
                <Link
                  to={`/users/${answer.author._id}`}
                  className="ml-2 text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {answer.author.username}
                </Link>
              </>
            ) : (
              <></>
            )}
            <span className={`${showAuthor ? "ml-4" : ""}`}>
              {new Date(answer.updatedAt).toLocaleString()}
            </span>

            {isAuthenticated && !isBanned && (
              <div className="ml-4 flex space-x-2">
                {/* Edit Section - Only Author Can Edit */}
                {(answer.author._id ? answer.author._id : answer.author) ===
                  userId && (
                  <>
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleEditSubmit}
                          className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-600"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={handleCancel}
                          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-500"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="text-yellow-500 dark:text-yellow-400 hover:text-yellow-600 dark:hover:text-yellow-600"
                      >
                        <FaEdit />
                      </button>
                    )}
                  </>
                )}

                {/* Delete Section - Author or Admin Can Delete */}
                {((answer.author._id ? answer.author._id : answer.author) ===
                  userId ||
                  isAdmin) && (
                  <button
                    onClick={handleDeleteClick}
                    className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-600"
                  >
                    <FaTrashAlt />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Answer;
