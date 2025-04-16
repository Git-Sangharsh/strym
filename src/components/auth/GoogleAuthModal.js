import React from "react";
import "./GoogleAuthModal.css";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";


const GoogleAuthModal = () => {
  const dispatch = useDispatch();
  const showGoogleAuth = useSelector((state) => state.showGoogleAuth);

  const closeModal = () => {
    dispatch({ type: "SET_SHOW_GOOGLE_AUTH" });
  };

  const handleLoginSuccess = (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    console.log("User Email:", decoded.email); // logs email
    console.log("Decoded Info:", decoded);     // logs full decoded token

    toast.success(`Welcome, ${decoded.name || "user"}!`);
    closeModal();
  };

  const handleLoginError = () => {
    toast.error("Google Login Failed. Try again.");
  };

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
              <h2 style={{ color: "#333" }}>🔐 Sign in with Google</h2>
              <div className="auth-content">
                <div style={{ width: "100%" }}>
                  <GoogleLogin
                    onSuccess={handleLoginSuccess}
                    onError={handleLoginError}
                    width="100%"
                  />
                </div>

                <button className="cancel-btn" onClick={closeModal}>
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <ToastContainer position="bottom-right" autoClose={6000} />
    </>
  );
};

export default GoogleAuthModal;
