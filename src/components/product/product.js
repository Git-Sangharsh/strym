import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import "./product.css";
import playIcon from "../assets/play.svg";
import pauseIcon from "../assets/pause.svg";
import nextIcon from "../assets/next.svg";
import previousIcon from "../assets/previous.svg";
import loopIcon from "../assets/loop.svg";
import shuffleIcon from "../assets/shuffle.svg";
import sortIcon from "../assets/sort.svg";
const Product = () => {
  const [api, setApi] = useState([]);
  const [originalData, setOriginalData] = useState([]); // Store original data for filtering
  const [playingIndex, setPlayingIndex] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayback, setIsPlayback] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLooping, setIsLooping] = useState(false);
  const [shuffleMode, setShuffleMode] = useState(false);
  const [isSorted, setIsSorted] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // New state for search term

  const audioRefs = useRef([]);

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_API}/tracks`
        );
        console.log("Fetched:", response.data);
        setApi(response.data);
        setOriginalData(response.data); // Save original data
      } catch (err) {
        console.error("Error fetching tracks", err);
      }
    };

    fetchTracks();

    // Cleanup function to stop all audio when component unmounts
    return () => {
      stopAllAudio();
    };
  }, []);

  // Filter data when search term changes
  useEffect(() => {
    if (searchTerm.trim() === "") {
      // If search term is empty, show all tracks
      setApi(originalData);
    } else {
      // Filter tracks based on title or singer name
      const filteredData = originalData.filter(
        (track) =>
          track.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          track.singer.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setApi(filteredData);
    }
  }, [searchTerm, originalData]);

  // Function to stop all audio
  const stopAllAudio = () => {
    audioRefs.current.forEach((audio) => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
    setIsPlaying(false);
    setPlayingIndex(null);
    setIsPlayback(false);
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Define handlers first before they're used
  const playRandomSong = (currentIndex) => {
    if (api.length <= 1) return; // No point shuffling if only 1 track

    const availableIndexes = api
      .map((_, i) => i) // Create array of indexes [0, 1, 2, ...]
      .filter((i) => i !== currentIndex); // Remove the current one

    const randomIndex =
      availableIndexes[Math.floor(Math.random() * availableIndexes.length)];

    // Stop current audio before playing new one
    if (audioRefs.current[currentIndex]) {
      audioRefs.current[currentIndex].pause();
    }

    handlePlay(randomIndex);
  };

  const handlePlay = (index) => {
    const audioSrc = api[index].audio;

    // Define handlers as named functions
    const timeUpdateHandler = () => {
      setCurrentTime(audioRefs.current[index].currentTime);
      setDuration(audioRefs.current[index].duration || 0);
    };

    const audioEndedHandler = () => {
      if (isLooping) return; // If looping is enabled, the audio will loop automatically

      if (shuffleMode) {
        playRandomSong(index);
      } else {
        // Play next song in sequence
        const nextIndex = (index + 1) % api.length;
        handlePlay(nextIndex);
      }
    };

    // Clear any existing event listeners before creating a new audio instance
    if (audioRefs.current[index]) {
      const oldAudio = audioRefs.current[index];
      oldAudio.pause();
      oldAudio.removeEventListener("timeupdate", timeUpdateHandler);
      oldAudio.removeEventListener("ended", audioEndedHandler);
    }

    // Create new audio instance
    const audio = new Audio(audioSrc);
    audio.loop = isLooping;
    audioRefs.current[index] = audio;

    // Add event listeners
    audio.addEventListener("timeupdate", timeUpdateHandler);
    audio.addEventListener("ended", audioEndedHandler);

    // Stop other audios
    audioRefs.current.forEach((aud, i) => {
      if (i !== index && aud) {
        aud.pause();
        aud.currentTime = 0;
      }
    });

    if (playingIndex === index && isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.currentTime = 0;
      audio.play().catch((error) => {
        console.error("Error playing audio:", error);
      });
      setPlayingIndex(index);
      setIsPlaying(true);
      setIsPlayback(true);
    }
  };

  const handleSeek = (e) => {
    const newTime = e.target.value;
    if (playingIndex !== null && audioRefs.current[playingIndex]) {
      audioRefs.current[playingIndex].currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleNext = () => {
    if (playingIndex !== null) {
      if (shuffleMode) {
        playRandomSong(playingIndex);
      } else {
        const nextIndex = (playingIndex + 1) % api.length;
        handlePlay(nextIndex);
      }
    }
  };

  const handlePrevious = () => {
    if (playingIndex !== null) {
      if (shuffleMode) {
        playRandomSong(playingIndex);
      } else {
        const prevIndex = (playingIndex - 1 + api.length) % api.length;
        handlePlay(prevIndex);
      }
    }
  };

  const handleLoopToggle = () => {
    setIsLooping((prev) => {
      const newLoopingState = !prev;
      if (playingIndex !== null && audioRefs.current[playingIndex]) {
        audioRefs.current[playingIndex].loop = newLoopingState;
      }
      return newLoopingState;
    });
  };

  const handleShuffleToggle = () => {
    setShuffleMode(!shuffleMode);
  };

  const handleSort = () => {
    const sortedData = [...api].sort((a, b) => {
      // If sorted in ascending order, sort in descending order on the next click
      if (isSorted) {
        return b.title.localeCompare(a.title); // Z-A sort
      }
      return a.title.localeCompare(b.title); // A-Z sort
    });
    setApi(sortedData);
    setIsSorted(!isSorted); // Toggle the sort state
  };

  useEffect(() => {
    // Update loop status for current audio when looping state changes
    if (playingIndex !== null && audioRefs.current[playingIndex]) {
      audioRefs.current[playingIndex].loop = isLooping;
    }
  }, [isLooping, playingIndex]); // Added playingIndex to dependency array

  useEffect(() => {
    const handleRouteChange = () => {
      stopAllAudio();
    };

    window.addEventListener("popstate", handleRouteChange);

    return () => {
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, []);

  return (
    <div className="product-container">
      <div className="product-sort">
        <div className="product-container-title">
          <h1>Trending</h1>
          <h1 className="product-clr">Music.</h1>
        </div>
        <div className="sort">
          <img
            onClick={handleSort}
            className={`sort-icon ${isSorted ? "bg-pad" : ""}`}
            src={sortIcon}
            alt="sort"
          />
        </div>
      </div>
      <div className="product-search">
        <input
          className="search-input"
          type="text"
          placeholder="Search by title or artist"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>
      <div   className={`product-wrapper ${searchTerm.trim() !== "" ? "product-wrapper-search" : ""}`}
      >
        {api.length > 0 ? (
          api.map((item, index) => (
            <div key={item._id} className="product-box">
              <div className="product-image-container">
                <img
                  src={item.image}
                  alt={item.title}
                  className="product-image"
                />

                <img
                  src={
                    isPlaying && playingIndex === index ? pauseIcon : playIcon
                  }
                  alt="Play/Pause"
                  className={`play-button ${
                    playingIndex === index && isPlaying
                      ? "play-button-visible"
                      : ""
                  }`}
                  onClick={() => handlePlay(index)}
                />
                <div
                  className={`product-image-overlay ${
                    playingIndex === index && isPlaying ? "active" : ""
                  }`}
                  onClick={() => handlePlay(index)}
                ></div>
              </div>
              <h3 className="product-title">{item.title}</h3>
              <h6 className="product-by">By {item.singer}</h6>
            </div>
          ))
        ) : searchTerm ? (
          <div className="no-results">No results found for "{searchTerm}"</div>
        ) : (
          <>
            <div className="product-box">
              <div
                className="product-image-container skeleton"
                style={{ height: "300px" }}
              ></div>
              <div
                className="product-title skeleton"
                style={{ height: "20px", marginTop: "10px", width: "80%" }}
              ></div>
              <div
                className="product-by skeleton"
                style={{ height: "15px", marginTop: "10px", width: "60%" }}
              ></div>
            </div>
            <div className="product-box">
              <div
                className="product-image-container skeleton"
                style={{ height: "300px" }}
              ></div>
              <div
                className="product-title skeleton"
                style={{ height: "20px", marginTop: "10px", width: "80%" }}
              ></div>
              <div
                className="product-by skeleton"
                style={{ height: "15px", marginTop: "10px", width: "60%" }}
              ></div>
            </div>
            <div className="product-box">
              <div
                className="product-image-container skeleton"
                style={{ height: "300px" }}
              ></div>
              <div
                className="product-title skeleton"
                style={{ height: "20px", marginTop: "10px", width: "80%" }}
              ></div>
              <div
                className="product-by skeleton"
                style={{ height: "15px", marginTop: "10px", width: "60%" }}
              ></div>
            </div>
            <div className="product-box">
              <div
                className="product-image-container skeleton"
                style={{ height: "300px" }}
              ></div>
              <div
                className="product-title skeleton"
                style={{ height: "20px", marginTop: "10px", width: "80%" }}
              ></div>
              <div
                className="product-by skeleton"
                style={{ height: "15px", marginTop: "10px", width: "60%" }}
              ></div>
            </div>
          </>
        )}
      </div>

      <AnimatePresence>
        <motion.div
          className="playback"
          initial={{ opacity: 0, y: "100%" }}
          animate={{ opacity: 1, y: isPlayback ? "0%" : "100%" }}
          transition={{ duration: 0.5 }}
        >
          <div className="playback-container">
            <img
              className={`playback-play-icon loop-icon ${
                shuffleMode ? "active-loop" : ""
              }`}
              src={shuffleIcon}
              alt=""
              onClick={handleShuffleToggle}
            />
            <img
              className="playback-play-icon next-previous-icon"
              src={previousIcon}
              alt=""
              onClick={handlePrevious}
            />
            <img
              src={isPlaying ? pauseIcon : playIcon}
              alt="Play/Pause"
              className="playback-play-icon"
              onClick={() => playingIndex !== null && handlePlay(playingIndex)}
            />
            <img
              className="playback-play-icon next-previous-icon"
              src={nextIcon}
              alt=""
              onClick={handleNext}
            />
            <img
              className={`playback-play-icon loop-icon ${
                isLooping ? "active-loop" : ""
              }`}
              src={loopIcon}
              alt=""
              onClick={handleLoopToggle}
            />
          </div>
          {playingIndex !== null && api[playingIndex] && (
            <h6 className="playing-track-name">
              {api[playingIndex].title} - {api[playingIndex].singer}
            </h6>
          )}
          <div className="progress-bar-container">
            <h6 className="progress-bar-time">{formatTime(currentTime)}</h6>
            <input
              type="range"
              className="progress-bar"
              min="0"
              max={duration}
              value={currentTime}
              onChange={handleSeek}
              style={{
                background: `linear-gradient(to right, #11CD91 0%, #11CD91 ${
                  (currentTime / duration) * 100
                }%, #ccc ${(currentTime / duration) * 100}%, #ccc 100%)`,
              }}
            />
            <h6 className="progress-bar-time">{formatTime(duration)}</h6>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Product;