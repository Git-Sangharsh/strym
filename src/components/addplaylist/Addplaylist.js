import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import "./Addplaylist.css";

const Addplaylist = () => {
  const [playlists, setPlaylists] = useState([]);
  const dispatch = useDispatch();
  const showAddPlaylist = useSelector((state) => state.showAddPlaylist); // Assuming `ui` is your reducer slice

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const token = localStorage.getItem("google_token");
        const decoded = token ? JSON.parse(atob(token.split(".")[1])) : null;
        const email = decoded?.email;

        const response = await axios.post(
          `${process.env.REACT_APP_BACKEND_API}/get-playlists`,
          {
            email,
          }
        );

        setPlaylists(response.data.playlists || []);
      } catch (error) {
        console.error("Error fetching playlists:", error);
      }
    };

    fetchPlaylists();
  }, []);

  const handleClose = () => {
    dispatch({ type: "TOGGLE_ADD_PLAYLIST" });
  };

  return (
    <>
      <AnimatePresence>
        {showAddPlaylist && (
          <motion.div
            className="auth-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            onClick={handleClose}
          >
            <motion.div
              className="auth-modal"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <h2 style={{ color: "#333" }}>🎵 Playlist List</h2>

              <div className="playlist-list">
                {playlists.length > 0 ? (
                  playlists.map((playlist, index) => (
                    <div key={index} className="playlist-item">
                      {playlist.name}
                    </div>
                  ))
                ) : (
                  <p>No playlists found.</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Addplaylist;
