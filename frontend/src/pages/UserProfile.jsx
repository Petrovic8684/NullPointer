import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import { baseUrl } from "../config/baseUrl";
import useAuth from "../hooks/useAuth";
import { MdAddPhotoAlternate } from "react-icons/md";

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

  const [image, setImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const cropperRef = useRef(null);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { isAuthenticated, token, userId, isAdmin, isBanned, loading } =
    useAuth();

  const handleCancel = () => {
    setIsModalOpen(false);
    setImage(null);
  };

  useEffect(() => {
    handleCancel();
    setQuestions([]);
    setAnswers([]);
    setToggleView("questions");
    setPageQuestions(1);
    setPageAnswers(1);

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

  const handleImageSelect = (e) => {
    setErrorMessage("");
    const file = e.target.files[0];
    const maxSize = 10 * 1024 * 1024; // 10MB limit
    if (file && file.size > maxSize) {
      alert("File size exceeds the 5MB limit.");
      return;
    }
    if (file) {
      setImage(URL.createObjectURL(file));
      setIsModalOpen(true);
    }
  };

  const handleImageUpload = async () => {
    try {
      setLoadingUpload(true);
      if (cropperRef.current) {
        const cropper = cropperRef.current.cropper;
        const croppedCanvas = cropper.getCroppedCanvas();

        if (croppedCanvas) {
          const dataUrl = croppedCanvas.toDataURL();

          const response = await axios.post(
            `${baseUrl}/users/uploadImage`,
            { image: dataUrl },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          setUser((prevUser) => ({
            ...prevUser,
            image: response.data.imageUrl,
          }));
        }

        setIsModalOpen(false);
      }
    } catch (error) {
      if (error.response && error.response.data) {
        setErrorMessage(error.response.data.message || "An error occurred!");
      } else {
        setErrorMessage("An error occurred during the upload!");
      }
    } finally {
      setLoadingUpload(false);
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
          <div className="flex flex-col items-center bg-white p-8 shadow-lg rounded-lg border dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center gap-x-4">
              <div className="relative">
                <img
                  src={user.image || "/unknown.jpg"}
                  width={130}
                  height={130}
                  className="rounded-full object-cover border-4 border-gray-200 shadow-lg dark:border-gray-700"
                  alt=""
                />
                {id === userId && (
                  <div className="absolute bottom-0 right-0">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      id="file-upload"
                      className="hidden"
                    />
                    <label
                      htmlFor="file-upload"
                      className="flex justify-center items-center w-10 h-10 bg-blue-400 dark:bg-blue-600 text-white rounded-full cursor-pointer hover:bg-blue-500 dark:hover:bg-blue-700"
                    >
                      <MdAddPhotoAlternate size={24} />
                    </label>
                  </div>
                )}
              </div>
              <div className="flex flex-col items-start justify-center">
                <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-200">
                  {user.username}
                </h1>
                {isModalOpen && (
                  <div className="modal fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
                    <div className="mx-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-4xl w-full">
                      <Cropper
                        id="cropper"
                        ref={cropperRef}
                        src={image}
                        style={{ height: 400, width: "100%" }}
                        aspectRatio={1}
                        viewMode={1}
                      />
                      {errorMessage && (
                        <div className="mt-4 text-center text-red-600 dark:text-red-400">
                          {errorMessage}
                        </div>
                      )}
                      <div className="mt-4 flex justify-between gap-4">
                        <button
                          onClick={handleImageUpload}
                          disabled={loadingUpload}
                          className={`px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 ${
                            loadingUpload ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                        >
                          {loadingUpload ? "Uploading..." : "Save"}
                        </button>
                        <button
                          onClick={handleCancel}
                          disabled={loadingUpload}
                          className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                <p className="text-gray-600 text-lg dark:text-gray-300">
                  Reputation: {user.reputation}
                </p>
                {user.isAdmin ? (
                  <p className="text-green-600 font-medium dark:text-green-400">
                    Admin
                  </p>
                ) : user.isBanned ? (
                  <p className="text-red-600 font-medium dark:text-red-400">
                    Banned
                  </p>
                ) : (
                  <></>
                )}
              </div>
            </div>

            {/* Admin Actions */}
            {isAdmin && !user.isAdmin && (
              <div className="mt-6 flex space-x-4">
                {!user.isBanned && (
                  <button
                    onClick={handlePromote}
                    className="px-6 py-3 bg-green-500 text-white rounded shadow hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 transition duration-200"
                  >
                    Promote User
                  </button>
                )}
                <button
                  onClick={handleBanUnban}
                  className={`px-6 py-3 text-white rounded shadow transition duration-200 ${
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
            <label className="flex items-center space-x-2 cursor-pointer">
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
            <label className="flex items-center space-x-2 cursor-pointer">
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
          <div className="mt-10 space-y-6 md:w-4/5 w-full mx-auto">
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
