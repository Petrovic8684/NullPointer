import React from "react";

const EmailSentPage = () => {
  return (
    <div className="h-screen flex flex-col justify-center items-center md:mx-20 mx-5">
      <h1 className="text-4xl text-center font-bold text-blue-600 mb-4 dark:text-blue-400">
        Email sent
      </h1>
      <p className="text-gray-700 text-center mb-6 text-center max-w-md dark:text-gray-300">
        An email with instructions to reset your password has been sent. Please
        check your inbox and follow the provided link to complete the process.
      </p>
    </div>
  );
};

export default EmailSentPage;
