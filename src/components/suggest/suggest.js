import React, { useState } from "react";
import "./Suggest.css";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import {  toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import axios from "axios";

const Suggest = () => {
  const dispatch = useDispatch();
  const showSuggest = useSelector((state) => state.showSuggest);

  const closeModal = () => {
    dispatch({ type: "SET_SHOW_SUGGEST" });
  };

  const [formData, setFormData] = useState({
    song: "",
    artist: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_API}/suggestion`,
        {
          song: formData.song,
          artist: formData.artist,
        }
      );

      if (response.status === 201) {
        toast.success("Thanks for the suggestion! 🎶");
        console.log("Server response:", response.data);
        closeModal();

      } else {
        toast.error("Something went wrong.");
      }
    } catch (err) {
      console.error("Axios error:", err);
      toast.error("Server error. Please try again later.");
    }
  };

  return (
    <>
      <AnimatePresence>
        {showSuggest && (
          <motion.div
            className="suggest-overlay"
            onClick={closeModal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="suggest-modal"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <h2>🎧 Suggest a Song</h2>
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  name="song"
                  placeholder="Song Name"
                  value={formData.song}
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  name="artist"
                  placeholder="Artist Name"
                  value={formData.artist}
                  onChange={handleChange}
                  required
                />
                {/* <textarea
                name="message"
                placeholder="Why this song? (optional)"
                value={formData.message}
                onChange={handleChange}
              /> */}
                <div className="modal-buttons">
                  <button className="submit-btn" type="submit">
                    Submit
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Suggest;
