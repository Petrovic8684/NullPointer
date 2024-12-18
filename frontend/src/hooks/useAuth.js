import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { baseUrl } from "../config/baseUrl";

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isBanned, setIsBanned] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authenticateUser = async () => {
      const savedToken = localStorage.getItem("token");
      if (savedToken) {
        try {
          const decodedToken = jwtDecode(savedToken);
          setToken(savedToken);
          setIsAuthenticated(true);
          setUserId(decodedToken.userId);

          const response = await axios.get(
            `${baseUrl}/users/${decodedToken.userId}`
          );

          setIsAdmin(response.data.isAdmin);
          setIsBanned(response.data.isBanned);
        } catch (error) {
          console.error("Authentication error: ", error);
          setIsAuthenticated(false);
          setUserId(null);
          setIsAdmin(false);
          setIsBanned(null);
        }
      } else {
        setIsAuthenticated(false);
        setToken(null);
        setUserId(null);
        setIsAdmin(false);
        setIsBanned(null);
      }
      setLoading(false);
    };

    authenticateUser();
  }, []);

  return {
    isAuthenticated,
    token,
    userId,
    isAdmin,
    isBanned,
    loading,
  };
};

export default useAuth;
