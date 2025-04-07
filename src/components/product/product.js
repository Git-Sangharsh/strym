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

const Product = () => {
  const [api, setApi] = useState([]);
  const [playingIndex, setPlayingIndex] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayback, setIsPlayback] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLooping, setIsLooping] = useState(false);
  const [shuffleMode, setShuffleMode] = useState(false);

  const audioRefs = useRef([]);

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_API}/tracks`
        );
        console.log("Fetched:", response.data);
        setApi(response.data);
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

  const handlePlay = (index) => {
    const audioSrc = `${process.env.REACT_APP_BACKEND_API}${api[index].audio}`;

    if (!audioRefs.current[index]) {
      const audio = new Audio(audioSrc);
      audio.loop = isLooping;
      audioRefs.current[index] = audio;

      audio.addEventListener("ended", () => setIsPlaying(false));

      audio.addEventListener("timeupdate", () => {
        setCurrentTime(audio.currentTime);
        setDuration(audio.duration || 0);
      });

      audio.addEventListener("ended", () => {
        if (shuffleMode) {
          playRandomSong(index);
        } else {
          setIsPlaying(false);
        }
      });
    }

    const audio = audioRefs.current[index];

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
      audio.play();
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
      const nextIndex = (playingIndex + 1) % api.length;
      handlePlay(nextIndex);
    }
  };

  const handlePrevious = () => {
    if (playingIndex !== null) {
      const prevIndex = (playingIndex - 1 + api.length) % api.length;
      handlePlay(prevIndex);
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

  const playRandomSong = (currentIndex) => {
    if (api.length <= 1) return;

    let randomIndex = Math.floor(Math.random() * api.length);
    while (randomIndex === currentIndex) {
      randomIndex = Math.floor(Math.random() * api.length);
    }
    handlePlay(randomIndex);
  };

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
      <div className="product-container-title">
        <h1>Trending</h1>
        <h1 className="product-clr">Music.</h1>
      </div>

      <div className="product-wrapper">
        {api.length > 0 ? (
          api.map((item, index) => (
            <div key={item._id} className="product-box">
              <div
                className="product-image-container"
              >
                <img
                  src={`${process.env.REACT_APP_BACKEND_API}${item.image}`}
                  alt={item.title}
                  className="product-image"
                />
                <img
                  src={
                    isPlaying && playingIndex === index
                      ? pauseIcon
                      : playIcon
                  }
                  alt="Play/Pause"
                  className={`play-button ${(playingIndex === index && isPlaying) ? 'play-button-visible' : ''}`}
                  onClick={() => handlePlay(index)}
                />
                <div
                  className={`product-image-overlay ${(playingIndex === index && isPlaying) ? 'active' : ''}`}
                  onClick={() => handlePlay(index)}
                ></div>
              </div>
              <h3 className="product-title">{item.title}</h3>
              <h6 className="product-by">By {item.singer}</h6>
            </div>
          ))
        ) : (
          <>
            <div className="product-box">
              <div className="product-image-container skeleton" style={{height: "300px"}}></div>
              <div className="product-title skeleton" style={{height: "20px", marginTop: "10px", width: "80%"}}></div>
              <div className="product-by skeleton" style={{height: "15px", marginTop: "10px", width: "60%"}}></div>
            </div>
            <div className="product-box">
              <div className="product-image-container skeleton" style={{height: "300px"}}></div>
              <div className="product-title skeleton" style={{height: "20px", marginTop: "10px", width: "80%"}}></div>
              <div className="product-by skeleton" style={{height: "15px", marginTop: "10px", width: "60%"}}></div>
            </div>
            <div className="product-box">
              <div className="product-image-container skeleton" style={{height: "300px"}}></div>
              <div className="product-title skeleton" style={{height: "20px", marginTop: "10px", width: "80%"}}></div>
              <div className="product-by skeleton" style={{height: "15px", marginTop: "10px", width: "60%"}}></div>
            </div>
            <div className="product-box">
              <div className="product-image-container skeleton" style={{height: "300px"}}></div>
              <div className="product-title skeleton" style={{height: "20px", marginTop: "10px", width: "80%"}}></div>
              <div className="product-by skeleton" style={{height: "15px", marginTop: "10px", width: "60%"}}></div>
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
          {playingIndex !== null && (
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