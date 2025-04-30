import React from "react";
import "./GoogleAuthModal.css";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { useEffect } from "react";

const GoogleAuthModal = () => {
  const dispatch = useDispatch();
  const showGoogleAuth = useSelector((state) => state.showGoogleAuth);
  const userState = useSelector((state) => state.userState);

  const closeModal = () => {
    dispatch({ type: "SET_SHOW_GOOGLE_AUTH" });
  };

  const handleLoginSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      // console.log("User Email:", decoded.email);
      // console.log("Decoded Info:", decoded);

      // Save token in localStorage
      localStorage.setItem("google_token", credentialResponse.credential);

      // Set user in Redux
      dispatch({
        type: "SET_USER",
        payload: {
          name: decoded.name,
          email: decoded.email,
        },
      });

      toast.success(`Welcome, ${decoded.name || "user"}!`);
      closeModal();

      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_API}/google-auth`,
        {
          userName: decoded.name,
          email: decoded.email,
        }
      );

      console.log("Response Data:", response.data);
      toast.success("User logged in successfully!");
    } catch (error) {
      console.error("Error during login:", error);
      toast.error("Login failed. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("google_token");
    dispatch({ type: "LOGOUT_USER" });
    toast.info("Logged out successfully.", { autoClose: 3000 });
  };

  const handleLoginError = () => {
    toast.error("Google Login Failed. Try again.");
  };

  useEffect(() => {
    const token = localStorage.getItem("google_token");
    if (token) {
      const decoded = jwtDecode(token);
      dispatch({
        type: "SET_USER",
        payload: {
          name: decoded.name,
          email: decoded.email,
        },
      });
    }
  }, [dispatch]);

  // const hello = localStorage.getItem("google_token");
  // const decodedHello = jwtDecode(hello)
  // console.log("hello", decodedHello)

  return (
    <>
      <AnimatePresence>
        {showGoogleAuth && (
          <motion.div
            className="auth-overlay"
            onClick={closeModal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="auth-modal"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <h2 style={{ color: "#333" }}>
              {userState ?  "🔓 Logout":
                "🔐 Sign in with Google"}</h2>
              <div className="auth-content">
                {userState ? (
                  <button className="cancel-btn" onClick={handleLogout}>
                    Logout
                  </button>
                ) : (
                  <>
                    <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                      <GoogleLogin
                        onSuccess={handleLoginSuccess}
                        onError={handleLoginError}
                        width="100%"
                      />
                    </div>

                    <button className="cancel-btn" onClick={closeModal}>
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GoogleAuthModal;
