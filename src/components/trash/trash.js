import axios from 'axios';
import React, { useEffect, useState } from 'react';
import "./trash.css";
import trashSvg from "../assets/trash.svg";
import { motion, AnimatePresence } from 'framer-motion';

const Trash = () => {
  const [trashData, setTrashData] = useState([]);
  const [deletingTitle, setDeletingTitle] = useState(null); // For animation

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_API}/tracks`);
        setTrashData(response.data);
      } catch (err) {
        console.error("Error fetching tracks", err);
      }
    };

    fetchTracks();
  }, []);

  const handleDelete = async (titleToDelete) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete "${titleToDelete}"?`);
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");

      const res = await axios.delete(
        `${process.env.REACT_APP_BACKEND_API}/track/${encodeURIComponent(titleToDelete)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(res.data.message);

      // Animate out and remove from UI
      setDeletingTitle(titleToDelete);

      setTimeout(() => {
        setTrashData(prev => prev.filter(track => track.title !== titleToDelete));
        setDeletingTitle(null);
      }, 500);
    } catch (err) {
      console.error("Error deleting track:", err);
      alert("Failed to delete track");
    }
  };


  return (
    <div className='trash-container'>
      <div className="trash-wrapper">
        <AnimatePresence>
          {trashData.map((i, index) => (
            <motion.div
              key={i.title}
              className="trash-box"
              initial={{ opacity: 1, scale: 1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.5 }}
              layout
            >
              <img
                src={`${i.image}`}
                alt={i.title}
                className="trash-image"
              />
              <h3>{i.title}</h3>
              <img
                src={trashSvg}
                alt="trash"
                className="trash-icon"
                onClick={() => handleDelete(i.title)}
                style={{ cursor: 'pointer' }}
              />
            </motion.div>
          )).filter(item => item.key !== deletingTitle)}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Trash;
