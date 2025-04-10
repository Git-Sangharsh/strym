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
import favoriteIcon from "../assets/favorite.svg";
import fillIcon from "../assets/fill.svg";

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
  const [storeFavorites, setStoreFavorites] = useState(() => {
    return JSON.parse(localStorage.getItem("favorites")) || [];
  });
  const [showFavorites, setShowFavorites] = useState(false);
  const [displayData, setDisplayData] = useState([]);
  const [playingTrackTitle, setPlayingTrackTitle] = useState(null);
  const [playingTrackSinger, setPlayingTrackSinger] = useState(null);

  const audioRefs = useRef([]);
  const pausedTimeRef = useRef({}); // Store paused time for each track

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_API}/tracks`
        );
        setApi(response.data);
        setOriginalData(response.data); // Save original data
        setDisplayData(response.data);
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

  // console.log(api

  // )

  // Filter data based on search term and favorites toggle
  useEffect(() => {
    let filteredData = originalData;

    if (searchTerm.trim() !== "") {
      filteredData = filteredData.filter(
        (track) =>
          track.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          track.singer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (showFavorites) {
      filteredData = filteredData.filter((track) =>
        storeFavorites.includes(track.title)
      );
    }

    // Re-apply sorting if it's enabled
    if (isSorted) {
      filteredData = [...filteredData].sort((a, b) =>
        a.title.localeCompare(b.title)
      );
    }

    setDisplayData(filteredData);
  }, [
    searchTerm,
    showFavorites,
    originalData,
    storeFavorites,
    api,
    playingIndex,
    isSorted, // <-- Add this dependency
  ]);

  // Function to stop all audio
  const stopAllAudio = () => {
    audioRefs.current.forEach((audio, index) => {
      if (audio) {
        // Store the current time before stopping
        pausedTimeRef.current[index] = audio.currentTime;
        audio.pause();
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

  // Play random song from currently displayed tracks
  const playRandomSong = (currentIndex) => {
    if (displayData.length <= 1) return;

    const availableIndexes = displayData
      .map((_, i) => i)
      .filter((i) => i !== currentIndex);

    const randomIndex =
      availableIndexes[Math.floor(Math.random() * availableIndexes.length)];

    if (audioRefs.current[currentIndex]) {
      // Store the current time before stopping
      pausedTimeRef.current[currentIndex] =
        audioRefs.current[currentIndex].currentTime;
      audioRefs.current[currentIndex].pause();
    }

    handlePlay(randomIndex);
  };

  const handlePlay = (index, title, singer) => {
    const audioSrc = displayData[index].audio;
    const trackId = displayData[index].title;
    // console.log("index", index);
    // console.log("title", title);
    setPlayingTrackTitle(title);
    setPlayingTrackSinger(singer);

    // console.log("trackId", trackId)
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
        const nextIndex = (index + 1) % displayData.length;
        handlePlay(nextIndex, displayData[nextIndex].title, displayData[nextIndex].singer);
      }
    };

    // Check if we're toggling play/pause for the currently playing track
    const isTogglingCurrentTrack = playingIndex === index && isPlaying;

    // Clear any existing event listeners before creating a new audio instance
    if (audioRefs.current[index]) {
      const oldAudio = audioRefs.current[index];

      if (isTogglingCurrentTrack) {
        // We're pausing the current track - save its time
        pausedTimeRef.current[trackId] = oldAudio.currentTime;
        oldAudio.pause();
        setIsPlaying(false);
        return; // Exit early - we're just pausing, not creating a new audio instance
      }

      oldAudio.pause();
      oldAudio.removeEventListener("timeupdate", timeUpdateHandler);
      oldAudio.removeEventListener("ended", audioEndedHandler);
    }

    // Stop other audios
    audioRefs.current.forEach((audio, i) => {
      if (i !== index && audio) {
        // Store the current time before stopping
        const otherTrackId = displayData[i]?._id;
        if (otherTrackId) {
          pausedTimeRef.current[otherTrackId] = audio.currentTime;
        }
        audio.pause();
      }
    });

    // Create new audio instance
    const audio = new Audio(audioSrc);
    audio.loop = isLooping;
    audioRefs.current[index] = audio;

    // Add event listeners
    audio.addEventListener("timeupdate", timeUpdateHandler);
    audio.addEventListener("ended", audioEndedHandler);

    // Restore previous position if available
    if (pausedTimeRef.current[trackId] && pausedTimeRef.current[trackId] > 0) {
      audio.currentTime = pausedTimeRef.current[trackId];
    }

    // Play the audio
    audio.play().catch((error) => {
      console.error("Error playing audio:", error);
    });

    setPlayingIndex(index);
    setIsPlaying(true);
    setIsPlayback(true);
  };

  const handleSeek = (e) => {
    const newTime = e.target.value;
    if (playingIndex !== null && audioRefs.current[playingIndex]) {
      audioRefs.current[playingIndex].currentTime = newTime;

      // Also update the stored paused time
      const trackId = displayData[playingIndex]?._id;
      if (trackId) {
        pausedTimeRef.current[trackId] = newTime;
      }

      setCurrentTime(newTime);
    }
  };

  const handleNext = () => {
    if (playingIndex !== null) {
      const nextIndex = (playingIndex + 1) % displayData.length;
      const nextTrack = displayData[nextIndex];

      if (nextTrack) {
        handlePlay(nextIndex, nextTrack.title, nextTrack.singer);
      }
    }
  };

  const handlePrevious = () => {
    if (playingIndex !== null) {
      if (shuffleMode) {
        playRandomSong(playingIndex);
      } else {
        const prevIndex = (playingIndex - 1 + displayData.length) % displayData.length;
        const prevTrack = displayData[prevIndex];

        if (prevTrack) {
          handlePlay(prevIndex, prevTrack.title, prevTrack.singer);
        }
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
    const sortedData = [...displayData].sort((a, b) => {
      if (isSorted) {
        return b.title.localeCompare(a.title); // Z-A sort
      }
      return a.title.localeCompare(b.title); // A-Z sort
    });
    setDisplayData(sortedData);
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

  // Handle play/pause toggle for the playback bar
  const handlePlaybackToggle = () => {
    if (playingIndex !== null) {
      if (isPlaying) {
        // Pause current audio
        const audio = audioRefs.current[playingIndex];
        if (audio) {
          const trackId = displayData[playingIndex]?._id;
          if (trackId) {
            pausedTimeRef.current[trackId] = audio.currentTime;
          }
          audio.pause();
          setIsPlaying(false);
        }
      } else {
        // Resume current audio
        const audio = audioRefs.current[playingIndex];
        if (audio) {
          audio.play().catch((error) => {
            console.error("Error playing audio:", error);
          });
          setIsPlaying(true);
        }
      }
    }
  };

  const currentTrack = playingIndex !== null ? displayData[playingIndex] : null;

  const isFavorite = currentTrack
    ? storeFavorites.includes(currentTrack.title)
    : false;

  const handleFavorite = () => {
    if (!currentTrack) return;

    const title = currentTrack.title;
    let updatedFavorites;

    if (storeFavorites.includes(title)) {
      updatedFavorites = storeFavorites.filter((fav) => fav !== title); // remove
    } else {
      updatedFavorites = [...storeFavorites, title]; // add
    }

    setStoreFavorites(updatedFavorites);
    localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
  };

  const handleShowFavorites = () => {
    setShowFavorites(!showFavorites);
  };

  // console.log(currentTrack?.title);
  // console.log("displayData", displayData);
  // console.log("playingIndex", playingIndex);
  // console.log("currentTrack", playingTrackTitle);
  // console.log("showFavorites", showFavorites);
  return (
    <div className="product-container">
      <div className="product-sort">
        <div className="product-container-title">
          <h1>{showFavorites ? "Liked" : "Trending"}</h1>
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
      <div className="like-section" onClick={handleShowFavorites}>
        <h1 className="like-section-title">
          {showFavorites ? "Show All Songs" : "Liked Songs"}
        </h1>
      </div>
      <div
        className={`product-wrapper ${
          searchTerm.trim() !== "" || showFavorites
            ? "product-wrapper-search"
            : ""
        }`}
      >
        {Array.isArray(displayData) && displayData.length > 0 ? (
          displayData.map((item, index) => (
            <div key={item._id} className="product-box">
              <div className="product-image-container">
                <img
                  src={item.image}
                  alt={item.title}
                  className="product-image"
                />

                <img
                  src={
                    isPlaying &&
                    playingTrackTitle === item.title &&
                    playingTrackSinger === item.singer
                      ? pauseIcon
                      : playIcon
                  }
                  alt="Play/Pause"
                  className={`play-button ${
                    isPlaying &&
                    playingTrackTitle === item.title &&
                    playingTrackSinger === item.singer
                      ? "play-button-visible"
                      : ""
                  }`}
                  onClick={() => handlePlay(index, item.title, item.singer)}
                />

                <div
                  className={`product-image-overlay ${
                    isPlaying &&
                    playingTrackTitle === item.title &&
                    playingTrackSinger === item.singer
                      ? "active"
                      : ""
                  }`}
                  onClick={() => handlePlay(index, item.title, item.singer)}
                ></div>
              </div>
              <h3 className="product-title">{item.title}</h3>
              <h6 className="product-by">By {item.singer}</h6>
            </div>
          ))
        ) : searchTerm || showFavorites ? (
          <div className="no-results">
            {showFavorites
              ? "No liked songs found"
              : `No results found for "${searchTerm}"`}
          </div>
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
              onClick={handlePlaybackToggle}
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
            {currentTrack && (
              <AnimatePresence mode="wait">
                <motion.img
                  onClick={handleFavorite}
                  key={isFavorite ? "filled" : "outline"}
                  src={isFavorite ? fillIcon : favoriteIcon}
                  alt="Favorite"
                  className="favorite-icon"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </AnimatePresence>
            )}
          </div>
          {/* Track  Title and Singer   */}
          {playingIndex !== null && displayData[playingIndex] && (
            <h6 className="playing-track-name">
              {playingTrackTitle} - {playingTrackSinger}
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
