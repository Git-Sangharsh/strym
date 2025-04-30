import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import "./Addplaylist.css";
import {  toast } from "react-toastify";


const Addplaylist = () => {
  const [playlists, setPlaylists] = useState([]);
  const dispatch = useDispatch();
  const showAddPlaylist = useSelector((state) => state.showAddPlaylist);
  const trackTitle = useSelector((state) => state.storeTrackTitle);

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const token = localStorage.getItem("google_token");

        const response = await axios.post(
          `${process.env.REACT_APP_BACKEND_API}/get-playlist`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        // console.log(response.data)
        setPlaylists(response.data.playlists || []);
      } catch (error) {
        console.error("Error fetching playlists:", error);
      }
    };

    fetchPlaylists();
  }, [showAddPlaylist]);


  const handleClose = () => {
    dispatch({ type: "TOGGLE_ADD_PLAYLIST" });
  };

  const handleAddToPlaylist = async (playlistTitle) => {
    try {
      const token = localStorage.getItem("google_token");

      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_API}/addto-playlist`,
        {
          playlistTitle,
          trackTitle,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success("Track added to playlist!");
        handleClose();
      } else {
        toast.error("Failed to add track.");
      }

      console.log("Add to playlist response:", response.data);
    } catch (error) {
      console.error("Error adding to playlist:", error);
      toast.error("Something went wrong!");
    }
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
              className="auth-modal playlist-auth-modal"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <h2 className="playlist-header" >Playlist List</h2>

              <div className="playlist-list">
                {playlists.length > 0 ? (
                  playlists.map((playlist, index) => (
                    <div key={index} className="playlist-item" onClick={() => handleAddToPlaylist(playlist.name)} >
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
