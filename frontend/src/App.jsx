import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { DarkModeProvider } from "./hooks/useDarkMode";

import LandingPage from "./pages/Landing";
import LoginPage from "./pages/auth/Login";
import RegisterPage from "./pages/auth/Register";
import EmailSentPage from "./pages/auth/EmailSent";
import ResetPasswordPage from "./pages/auth/ResetPassword";
import QuestionsPage from "./pages/Questions";
import SingleQuestionPage from "./pages/SingleQuestion";
import UserProfilePage from "./pages/UserProfile";
import SingleAnswerPage from "./pages/SingleAnswer";
import UsersPage from "./pages/Users";

function App() {
  return (
    <DarkModeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<EmailSentPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/questions" element={<QuestionsPage />} />
          <Route path="/questions/:id" element={<SingleQuestionPage />} />
          <Route path="/users/:id" element={<UserProfilePage />} />
          <Route path="/answers/:id" element={<SingleAnswerPage />} />
          <Route path="/users" element={<UsersPage />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </DarkModeProvider>
  );
}

export default App;
