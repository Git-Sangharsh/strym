import React, { useState } from 'react';
import './Suggest.css';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';

const Suggest = () => {
  const dispatch = useDispatch();
  const showSuggest = useSelector((state) => state.showSuggest);

  const closeModal = () => {
    dispatch({ type: 'SET_SHOW_SUGGEST' });
  };

  const [formData, setFormData] = useState({
    song: '',
    artist: '',
    message: '',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData); // Replace with API call if needed
    alert('Thanks for the suggestion!');
    closeModal();
  };

  return (
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
            transition={{ duration: 0.3, ease: 'easeInOut' }}
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
              <textarea
                name="message"
                placeholder="Why this song? (optional)"
                value={formData.message}
                onChange={handleChange}
              />
              <div className="modal-buttons">
                <button type="submit">Submit</button>
                <button type="button" onClick={closeModal} className="cancel-btn">
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Suggest;
