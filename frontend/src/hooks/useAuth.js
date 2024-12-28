import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { baseUrl } from "../config/baseUrl";

const useAuth = () => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    token: null,
    userId: null,
    isAdmin: false,
    isBanned: null,
    loading: true,
  });

  useEffect(() => {
    const authenticateUser = async () => {
      const savedToken = localStorage.getItem("token");
      const savedUserData = JSON.parse(localStorage.getItem("userData"));

      if (savedToken) {
        try {
          const decodedToken = jwtDecode(savedToken);

          if (savedUserData && savedUserData.userId === decodedToken.userId) {
            setAuthState({
              isAuthenticated: true,
              token: savedToken,
              userId: savedUserData.userId,
              isAdmin: savedUserData.isAdmin,
              isBanned: savedUserData.isBanned,
              loading: false,
            });
          } else {
            const response = await axios.get(
              `${baseUrl}:${import.meta.env.VITE_BACKEND_PORT}/users/${
                decodedToken.userId
              }`
            );

            const userData = {
              userId: decodedToken.userId,
              isAdmin: response.data.isAdmin,
              isBanned: response.data.isBanned,
            };

            localStorage.setItem("userData", JSON.stringify(userData));

            setAuthState({
              isAuthenticated: true,
              token: savedToken,
              userId: userData.userId,
              isAdmin: userData.isAdmin,
              isBanned: userData.isBanned,
              loading: false,
            });
          }
        } catch (error) {
          console.error("Authentication error: ", error);
          localStorage.removeItem("token");
          localStorage.removeItem("userData");
          setAuthState({
            isAuthenticated: false,
            token: null,
            userId: null,
            isAdmin: false,
            isBanned: null,
            loading: false,
          });
        }
      } else {
        setAuthState((prevState) => ({ ...prevState, loading: false }));
      }
    };

    authenticateUser();
  }, []);

  return {
    ...authState,
  };
};

export default useAuth;
