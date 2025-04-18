import React, { useState } from "react";
import "./CreatePlaylistModal.css";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";

const CreatePlaylistModal = () => {
  const dispatch = useDispatch();
  const playlistState = useSelector((state) => state.playlistState);

  const [playlistName, setPlaylistName] = useState("");

  const closeModal = () => {
    dispatch({ type: "SET_PLAYLIST_MODAL" });
    setPlaylistName("");
  };

  const googleToken = localStorage.getItem("google_token");
  const decodedGoogleToken = jwtDecode(googleToken);
  // console.log("hello", decodedGoogleToken.email);

  const handleCreatePlaylist = async () => {
    if (!playlistName) {
      toast.error("Please fill in all fields.");
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_API}/create-playlist`,
        {
          // email: user.email,
          email: decodedGoogleToken.email,
          playlistName
        }
      );

      console.log("Playlist Created:", response.data);
      toast.success("Playlist created!");
      closeModal();
    } catch (error) {
      console.error("Playlist creation error:", error);
      toast.error("Failed to create playlist.");
    }
  };

  return (
    <AnimatePresence>
      {playlistState && (
        <motion.div
          className="playlist-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeModal} // closes modal when clicking on overlay

        >
          <motion.div
            className="playlist-modal-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()} // prevents closing when clicking inside modal

          >
            <h2 style={{ color: "#333" }}>🎵 Create New Playlist</h2>
            <input
              type="text"
              placeholder="Playlist Name"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
            />

            <div className="modal-btns">
              <button onClick={handleCreatePlaylist}>Create Playlist</button>
              <button onClick={closeModal} className="cancel-btn">Cancel</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreatePlaylistModal;
