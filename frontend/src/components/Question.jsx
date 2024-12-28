import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { baseUrl } from "../config/baseUrl";
import { FaEdit, FaTrashAlt } from "react-icons/fa";

const Question = ({
  question,
  setQuestion,
  setQuestions,
  token,
  userId,
  isAuthenticated,
  isAdmin,
  isBanned,
  showAuthor,
  align,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(question.title);
  const [editedBody, setEditedBody] = useState(question.body);
  const navigate = useNavigate();

  const handleEditSubmit = async () => {
    try {
      const response = await axios.put(
        `${baseUrl}:${import.meta.env.VITE_BACKEND_PORT}/questions/${
          question._id
        }`,
        { title: editedTitle, body: editedBody },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!setQuestions) {
        setQuestion((prevQuestion) => ({
          ...prevQuestion,
          title: response.data.title,
          body: response.data.body,
          updatedAt: new Date(response.data.updatedAt),
        }));

        setIsEditing(false);
        return;
      }

      setQuestions((prevQuestions) =>
        prevQuestions.map((q) =>
          q._id === response.data._id
            ? {
                ...q,
                title: response.data.title,
                body: response.data.body,
                updatedAt: new Date(response.data.updatedAt),
              }
            : q
        )
      );

      setIsEditing(false);
    } catch (error) {
      console.error("Error editing the question: ", error);
    }
  };

  const handleCancel = () => {
    setEditedTitle(question.title);
    setEditedBody(question.body);
    setIsEditing(false);
  };

  const handleDelete = async (questionId) => {
    try {
      await axios.delete(
        `${baseUrl}:${
          import.meta.env.VITE_BACKEND_PORT
        }/questions/${questionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!setQuestions) {
        navigate(-1);
        return;
      }

      setQuestions((prevQuestions) =>
        prevQuestions.filter((q) => q._id !== questionId)
      );
    } catch (error) {
      console.error("Error deleting the question: ", error);
    }
  };

  const handleDeleteClick = async () => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      await handleDelete(question._id);
    }
  };

  if (!question) {
    return (
      <div className="text-gray-500 dark:text-gray-400 mb-4">Loading...</div>
    );
  }

  return (
    <div
      key={question._id}
      className={`border-b border-gray-300 dark:border-gray-600 py-4 text-${align}`}
    >
      {isEditing ? (
        <>
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className={`w-full mb-2 p-2 border border-gray-300 rounded dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 text-${align}`}
            placeholder="Edit Title"
          />
          <textarea
            value={editedBody}
            onChange={(e) => setEditedBody(e.target.value)}
            className={`w-full p-2 border border-gray-300 rounded dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 resize-none text-${align}`}
            placeholder="Edit Body"
          />
        </>
      ) : (
        <>
          <Link
            to={`/questions/${question._id}`}
            className="text-lg font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            {question.title}
          </Link>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {question.body.substring(0, 60)}...
          </p>
        </>
      )}

      {showAuthor && (
        <p className="text-sm text-gray-800 dark:text-gray-200 mt-1">
          Posted by{" "}
          <Link
            to={`/users/${question.author._id}`}
            className="text-blue-500 dark:text-blue-300 hover:underline"
          >
            {question.author.username}
          </Link>
        </p>
      )}

      <p className="text-sm text-gray-500 dark:text-gray-400">
        Views: {question.views}{" "}
        {question.answers.length !== 0
          ? `| Answers: ${question.answers.length}`
          : ""}
      </p>

      {/* Edit and Delete Section */}
      {isAuthenticated && !isBanned && (
        <div className={`mt-2 flex space-x-2 justify-${align}`}>
          {/* Edit Button - Visible only for Author */}
          {(question.author._id ? question.author._id : question.author) ===
            userId && (
            <>
              {isEditing ? (
                <button
                  onClick={handleEditSubmit}
                  className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-600 text-sm"
                >
                  Confirm
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-yellow-500 dark:text-yellow-400 hover:text-yellow-600 dark:hover:text-yellow-600"
                >
                  <FaEdit />
                </button>
              )}
              {isEditing && (
                <button
                  onClick={handleCancel}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-500 text-sm"
                >
                  Cancel
                </button>
              )}
            </>
          )}

          {/* Delete Button - Visible for Author or Admin */}
          {((question.author._id ? question.author._id : question.author) ===
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
  );
};

export default Question;
