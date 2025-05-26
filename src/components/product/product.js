import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import "./product.css";
import playIcon from "../assets/play.svg";
import pauseIcon from "../assets/pause.svg";
import nextIcon from "../assets/next.svg";
import previousIcon from "../assets/previous.svg";
import loopIcon from "../assets/loop.svg";
import shuffleIcon from "../assets/shuffle.svg";
import trashIcon from "../assets/trashwhite.svg";
import removeIcon from "../assets/remove.svg";
// import sortIcon from "../assets/sort.svg";
import favoriteIcon from "../assets/favorite.svg";
import fillIcon from "../assets/fill.svg";
import addSvg from "../assets/add.svg";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import { jwtDecode } from "jwt-decode";
import Activeusers from "../activeusers/Activeusers";

const Product = () => {
  const dispatch = useDispatch();

  // State variables
  const [playingIndex, setPlayingIndex] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayback, setIsPlayback] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLooping, setIsLooping] = useState(false);
  const [shuffleMode, setShuffleMode] = useState(false);
  // const [isSorted, setIsSorted] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // New state for search term
  const [showFavorites, setShowFavorites] = useState(false);
  const [likeSongs, setlikeSongs] = useState([]);
  const [displayData, setDisplayData] = useState([]);
  const [allTracks, setAllTracks] = useState([]);
  const [allTracksActive, setAllTracksActive] = useState(true);
  const [playingTrackTitle, setPlayingTrackTitle] = useState(null);
  const [playingTrackSinger, setPlayingTrackSinger] = useState(null);
  const [playingTrackId, setPlayingTrackId] = useState(null);
  const [activePlaylist, setActivePlaylist] = useState(null); // track active playlist
  const [selectedTrackId, setSelectedTrackId] = useState(null);
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [removeTrack, setRemoveTrack] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState(null);
  const [adminEmail, setAdminEmail] = useState(null);
  // const [roomId, setRoomId] = useState("123"); // room id input from user or set programmatically
  const roomId = "123";
  const socketRef = useRef(null);

  // Redux state
  const isLogin = useSelector((state) => state.isLogin);
  const storeGetPlaylist = useSelector((state) => state.storeGetPlaylist);
  const roomStatus = useSelector((state) => state.roomStatus);
  // Refs
  const audioRefs = useRef([]);
  const pausedTimeRef = useRef({}); // Store paused time for each track
  const shuffleModeRef = useRef(shuffleMode);

  const isUserAdmin = currentUserEmail === adminEmail;

  // Utility functions
  const formatTime = (time) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

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

  // API calls
  const fetchPlaylists = useCallback(async () => {
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

      dispatch({
        type: "SET_STORE_GET_PLAYLIST",
        payload: response.data.playlists,
      });
    } catch (error) {
      console.error("Error fetching playlists:", error);
    }
  }, [dispatch]);

  const getLikedSongs = async () => {
    try {
      const token = localStorage.getItem("google_token");

      if (!token) {
        console.error("No token found in localStorage");
        return;
      }

      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_API}/liked-tracks`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // console.log(response.data);
      setlikeSongs(response.data.likedTracks);
      // Do something with the data if needed
    } catch (err) {
      console.error("Error fetching liked tracks:", err);
    }
  };

  // Audio control functions
  const playRandomSong = (currentIndex) => {
    if (displayData.length <= 1) return;

    // Get the current track title
    const currentTitle = displayData[currentIndex].title;

    // Filter out the current track by title
    const availableTracks = displayData.filter(
      (track) => track.title !== currentTitle
    );

    // Select a random track from the available tracks
    const randomTrack =
      availableTracks[Math.floor(Math.random() * availableTracks.length)];

    // Find the index of the random track in the displayData array
    const randomIndex = displayData.findIndex(
      (track) => track.title === randomTrack.title
    );

    if (randomIndex !== -1) {
      if (audioRefs.current[currentIndex]) {
        // Store the current time before stopping
        pausedTimeRef.current[currentIndex] =
          audioRefs.current[currentIndex].currentTime;
        audioRefs.current[currentIndex].pause();
      }

      // Play the random track using its title and singer
      handlePlay(randomIndex, randomTrack.title, randomTrack.singer);
    }
  };

  const handlePlay = (index, title, singer, itemId) => {
    const audioSrc = displayData[index].audio;
    const trackId = displayData[index].title;
    // console.log("index", index);
    // console.log("title", title);
    setPlayingTrackTitle(title);
    setPlayingTrackSinger(singer);
    setPlayingTrackId(itemId);

    if (isUserAdmin) {
      const startTime = Date.now() + 500; // slight delay to allow sync

      socketRef.current?.emit("play-track", {
        roomId,
        track: {
          title,
          artist: singer,
          url: audioSrc,
          itemId,
          index, // needed to track which audio
        },
        startTime,
        resumeTime: pausedTimeRef.current[trackId] || 0,
      });
    }

    // console.log("trackId", trackId)
    // Define handlers as named functions
    const timeUpdateHandler = () => {
      setCurrentTime(audioRefs.current[index].currentTime);
      setDuration(audioRefs.current[index].duration || 0);
    };

    // console.log(shuffleMode);

    const audioEndedHandler = () => {
      if (isLooping) return;

      if (shuffleModeRef.current) {
        playRandomSong(index);
      } else {
        const nextIndex = (index + 1) % displayData.length;
        const nextTrack = displayData[nextIndex];

        // Update the title and singer before switching
        setPlayingTrackTitle(nextTrack.title);
        setPlayingTrackSinger(nextTrack.singer);
        setPlayingTrackId(itemId);

        handlePlay(nextIndex, nextTrack.title, nextTrack.singer);
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

  const handlePlaybackToggle = useCallback(() => {
    if (playingIndex !== null) {
      const audio = audioRefs.current[playingIndex];
      const trackId = displayData[playingIndex]?._id;
      const currentTrack = displayData[playingIndex];

      if (isPlaying) {
        if (audio) {
          pausedTimeRef.current[trackId] = audio.currentTime;
          audio.pause();
          setIsPlaying(false);

          // Only emit if user is admin
          if (isUserAdmin) {
            socketRef.current?.emit("pause-track", {
              roomId,
              index: playingIndex,
              currentTime: audio.currentTime,
              itemId: trackId,
            });
          }
        }
      } else {
        if (audio) {
          // Resume playback locally
          audio.play().catch(console.error);
          setIsPlaying(true);

          // Only emit if user is admin
          if (isUserAdmin) {
            socketRef.current?.emit("resume-track", {
              roomId,
              track: {
                ...currentTrack,
                artist: currentTrack.singer, // Ensure artist field is set
              },
              resumeTime: audio.currentTime,
            });
          }
        }
      }
    }
  }, [playingIndex, isPlaying, displayData, roomId, isUserAdmin]);

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
        const prevIndex =
          (playingIndex - 1 + displayData.length) % displayData.length;
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

  // Event handlers
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFavorite = async () => {
    try {
      const token = localStorage.getItem("google_token");

      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_API}/toggle-like`,
        {
          trackId: currentTrack._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // console.log("toggle-like response:", response.data);

      try {
        await getLikedSongs();
      } catch (err) {
        console.error("getLikedSongs error:", err);
      }

      toast.success(response?.data?.message || "Liked/unliked successfully");
    } catch (error) {
      console.error("Error in handleFavorite:", error);
      // toast.error("Something went wrong!");
    }
  };

  const handleShowFavorites = () => {
    setShowFavorites(!showFavorites);
    setActivePlaylist(null);
  };

  const handleAllTracks = () => {
    setDisplayData(allTracks);
    setAllTracksActive(true);
    setActivePlaylist(null);
    setShowFavorites(false);
    setRemoveTrack(false);
  };

  // Playlist functions
  const handlePlaylistModal = () => {
    dispatch({ type: "SET_PLAYLIST_MODAL" });
  };

  const handleAddTrackToPlaylist = (title) => {
    // console.log("title is", title);
    dispatch({ type: "SET_SHOW_TRACK_TITLE", payload: title });
  };

  const handleAddPlaylist = () => {
    dispatch({ type: "TOGGLE_ADD_PLAYLIST" });
  };

  const handlePlaylistTrack = async (playlistName) => {
    // if (activePlaylist === playlistName) {
    //   setActivePlaylist(null);
    //   setPlaylistTracks(allTracks); // Clear playlist tracks
    //   return;
    // }

    try {
      const token = localStorage.getItem("google_token");

      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_API}/get-specific-playlist`,
        { playlistName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setDisplayData(response.data.playlist.tracks);
      setActivePlaylist(playlistName); // Set the current active playlist
      setPlaylistTracks(response.data.playlist.tracks);
    } catch (err) {
      console.log(err);
    }
  };

  const handleDeletePlaylist = async (playlistName) => {
    const token = localStorage.getItem("google_token");
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_API}/delete-playlist`,
        { playlistName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success("Playlist deleted successfully");
        fetchPlaylists();
        setDisplayData(allTracks);
      } else {
        toast.error("Failed to delete playlist");
      }
    } catch (error) {
      console.error("Delete playlist error:", error);
      const message =
        error.response?.data?.error || "Something went wrong while deleting";
      toast.error(message);
    }
  };

  const handlRemoveFromPlaylist = async (trackId) => {
    try {
      const token = localStorage.getItem("google_token");

      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_API}/remove-from-playlist`,
        { playlistName: activePlaylist, trackId: playingTrackId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(response.data);

      if (response.status === 200) {
        toast.success(response.data.message);
        handlePlaylistTrack(activePlaylist);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleRoomStatus = useCallback(() => {
    dispatch({ type: "SET_ROOM_STATUS", payload: !roomStatus });
  }, [dispatch, roomStatus]);

  // Email From token
  const getUserEmailFromToken = () => {
    const token = localStorage.getItem("google_token");
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      return decoded.email;
    } catch {
      return null;
    }
  };

  // Set current user email on mount
  useEffect(() => {
    const email = getUserEmailFromToken();
    if (email) setCurrentUserEmail(email);
  }, []);

  // Socket functions
  const handleCreateRoom = () => {
    const email = getUserEmailFromToken();
    if (!email || !roomId) return;

    // Initialize socket connection if not exists
    if (!socketRef.current) {
      socketRef.current = io("http://localhost:3000");
    }

    socketRef.current.emit("create-room", {
      roomId,
      userEmail: email,
    });

    socketRef.current.on(
      "room-create-status",
      ({ success, admin, members, message }) => {
        if (success) {
          setAdminEmail(admin);
          console.log("✅ Room created with admin:", admin);
          console.log("👥 Members:", members);
          const updatedActiveUsers = Array.from(new Set([admin, ...members]));

          // Dispatch to update active users in state
          dispatch({ type: "SET_ACTIVE_USERS", payload: updatedActiveUsers });
          dispatch({ type: "SET_ROOM_STATUS", payload: !roomStatus }); //closing room box
          toast.success("room created succesfully!")

        } else {
          console.error("❌ Failed to create room:", message);
        }
      }
    );
  };

  const handleJoinRoom = () => {
    const email = getUserEmailFromToken();
    if (!email || !roomId) return;

    if (!socketRef.current) {
      socketRef.current = io("http://localhost:3000");
    }

    socketRef.current.emit("join-room", {
      roomId,
      userEmail: email,
    });

    socketRef.current.on(
      "room-join-status",
      ({ success, admin, members, message }) => {
        if (success) {
          setAdminEmail(admin);
          console.log("👑 Admin is:", admin);
          console.log("👥 Members:", members);
          dispatch({ type: "SET_ROOM_STATUS", payload: !roomStatus }); //closing room box
          toast.success("room join succefully!")
        } else {
          console.error("❌ Failed to join room:", message);
        }
      }
    );

    socketRef.current.on("user-joined", ({ userEmail, membersOfRoom }) => {
      console.log("👤 User joined:", userEmail);
      console.log("membersOfRoom ", membersOfRoom);
      // const updatedActiveUsers = Array.from(new Set([admin, ...members]));

      // Dispatch to update active users in state
      dispatch({ type: "SET_ACTIVE_USERS", payload: membersOfRoom });
    });

    socketRef.current.on(
      "play-track",
      ({ track, startTime, resumeTime = 0 }) => {
        const { url, itemId, index } = track;

        // Pause previous audio if any
        const prevAudio = audioRefs.current[index];
        if (prevAudio) {
          prevAudio.pause();
        }

        const audio = new Audio(url);
        audio.loop = isLooping;

        audioRefs.current[index] = audio;
        pausedTimeRef.current[itemId] = resumeTime;

        audio.currentTime = resumeTime;

        const delay = startTime - Date.now();
        if (delay > 0) {
          setTimeout(() => {
            audio.play().catch((e) => console.error("Play error:", e));
          }, delay);
        } else {
          audio.play().catch((e) => console.error("Play error:", e));
        }

        setPlayingIndex(index);
        setPlayingTrackTitle(track.title);
        setPlayingTrackSinger(track.artist);
        setIsPlaying(true);
      }
    );

    // Add pause-track listener here:
    socketRef.current.on("pause-track", ({ index, currentTime, itemId }) => {
      const audio = audioRefs.current[index];
      if (!audio) return;

      pausedTimeRef.current[itemId] = currentTime;
      audio.currentTime = currentTime;
      audio.pause();

      setIsPlaying(false);
    });

    // Add the missing resume-track listener
    socketRef.current.on("resume-track", ({ track, resumeTime }) => {
      console.log("🔄 Resume track received:", track.title, "at", resumeTime);

      // Find the track in displayData to get the correct index
      const trackIndex = displayData.findIndex(
        (t) => t._id === track._id || t.title === track.title
      );

      if (trackIndex === -1) {
        console.error("Track not found in displayData");
        return;
      }

      const audio = audioRefs.current[trackIndex];
      if (!audio) {
        console.error("Audio ref not found for track");
        return;
      }

      // Set the resume time and play
      audio.currentTime = resumeTime;
      audio.play().catch((e) => console.error("Resume play error:", e));

      // Update UI state
      setPlayingIndex(trackIndex);
      setPlayingTrackTitle(track.title);
      setPlayingTrackSinger(track.artist || track.singer);
      setPlayingTrackId(track._id || track.itemId);
      setIsPlaying(true);
      setCurrentTime(resumeTime);
    });
  };

  // roomStatus
  const closeRoomStatus = () => {
    dispatch({ type: "SET_ROOM_STATUS", payload: false });
  };

  const activeUsers = useSelector((state) => state.activeUsers);

  // socket users log
  useEffect(() => {
    if (!socketRef.current) return;
    const socket = socketRef.current;

    socket.on("user-joined", ({ userEmail, membersOfRoom }) => {
      // Only log if it's not the current user joining
      dispatch({ type: "SET_ACTIVE_USERS", payload: membersOfRoom });

      if (userEmail !== currentUserEmail) {
        console.log("✅ New user joined the room:", userEmail);

        // Additional log for admin context
        if (adminEmail === currentUserEmail) {
          console.log("👑 [ADMIN VIEW] User joined your room:", userEmail);
        }
      }
    });

    socket.on("user-left", ({ userEmail, members, admin }) => {
      // Only log if it's not the current user leaving
      if (userEmail !== currentUserEmail) {
        const removeLeftUser = activeUsers.filter(
          (email) => email !== userEmail
        );

        dispatch({ type: "SET_ACTIVE_USERS", payload: removeLeftUser });

        console.log("❌ User left the room:", userEmail);
        console.log("👥 Remaining members:", members);

        // Log admin changes
        if (admin !== adminEmail) {
          console.log("👑 New admin:", admin);
        }

        // Additional log for admin context
        if (adminEmail === currentUserEmail) {
          console.log("👑 [ADMIN VIEW] User left your room:", userEmail);
        }
      }
    });

    return () => {
      socket.off("user-joined");
      socket.off("user-left");
    };
  }, [currentUserEmail, adminEmail, dispatch, activeUsers]);

  // console.log("room users  is ", activeUsers);
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // useEffect hooks
  useEffect(() => {
    shuffleModeRef.current = shuffleMode;
  }, [shuffleMode]);

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_API}/tracks`
        );

        // Sort the tracks alphabetically by title
        const sortedTracks = response.data.sort((a, b) =>
          a.title.localeCompare(b.title)
        );

        // setApi(sortedTracks);
        // setOriginalData(sortedTracks); // Save sorted original data
        setDisplayData(sortedTracks);
        setAllTracks(sortedTracks); // full copy
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

  useEffect(() => {
    getLikedSongs();
  }, []);

  useEffect(() => {
    let baseTracks = activePlaylist ? playlistTracks : allTracks;

    if (searchTerm.trim() !== "") {
      baseTracks = baseTracks.filter(
        (track) =>
          track.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          track.singer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    const finalDisplayData = showFavorites ? likeSongs : baseTracks;
    setDisplayData(finalDisplayData);

    const stillExists = finalDisplayData.some(
      (track) => track._id === selectedTrackId
    );
    if (!stillExists) {
      setSelectedTrackId(null);
    }
  }, [
    searchTerm,
    showFavorites,
    likeSongs,
    allTracks,
    selectedTrackId,
    activePlaylist,
    playlistTracks,
  ]);

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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space" && e.target.tagName !== "INPUT") {
        e.preventDefault(); // Prevent page scrolling on space press
        handlePlaybackToggle();
      }
      // If "D" key is pressed and not in input, dispatch room status
      if (e.key.toLowerCase() === "d" && e.target.tagName !== "INPUT") {
        handleRoomStatus();
      }
    };

    // Add event listener
    document.addEventListener("keydown", handleKeyDown);

    // Remove event listener on cleanup
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handlePlaybackToggle, handleRoomStatus]);

  useEffect(() => {
    if (isLogin) {
      fetchPlaylists();
    }
  }, [dispatch, isLogin, fetchPlaylists]);

  useEffect(() => {
    if (showFavorites && activePlaylist) {
      setShowFavorites(false);
      setAllTracksActive(false);
    }
    if (activePlaylist) {
      setAllTracksActive(false);
    }
    if (showFavorites) {
      setActivePlaylist(null);
      setAllTracksActive(false);
      setRemoveTrack(false);
    }
  }, [activePlaylist, showFavorites]);

  useEffect(() => {
    if (activePlaylist && playingTrackTitle) {
      const isTrackInPlaylist = displayData.some(
        (track) => track.title === playingTrackTitle
      );
      isTrackInPlaylist ? setRemoveTrack(true) : setRemoveTrack(false);
    }
  }, [activePlaylist, playingTrackTitle, displayData]);

  // Computed values
  const currentTrack =
    displayData.find((track) => track._id === selectedTrackId) || null;

  const isFavorite =
    currentTrack &&
    likeSongs.some((track) => track._id === currentTrack._id) &&
    allTracks.some((track) => track._id === currentTrack._id);

  // console.log(removeTrack)
  // console.log(activePlaylist)
  // console.log(allTracks)
  // console.log(displayData);
  // console.log(currentTrack?.title);
  // console.log("displayData", displayData);
  // console.log("playingIndex", playingIndex);
  // console.log("currentTrack", playingTrackTitle);
  // console.log("showFavorites", showFavorites);
  console.log("current time  is", currentTime)

  return (
    <div className="product-container">
      <div className="product-sort">
        {/* <button onClick={handleCreateRoom}>Create Room</button>
        <button onClick={handleJoinRoom}>Join Room</button> */}
        <div className="product-container-title">
          <h1>{showFavorites ? "Liked" : "Trending"}</h1>
          <h1 className="product-clr">Music.</h1>
        </div>
        <div className="sort">
          <img
            // className={`sort-icon ${isSorted ? "bg-pad" : ""}`}
            onClick={handlePlaylistModal}
            className="sort-icon"
            src={addSvg}
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

      <div className="like-section" onClick={handleAllTracks}>
        <h1
          className={` ${
            allTracksActive ? "all-track-title-active" : "all-track-title"
          }`}
        >
          All Tracks
        </h1>
      </div>

      <div className="like-section" onClick={handleShowFavorites}>
        <h1
          className={`like-section-title main-like-songs-paddiing ${
            showFavorites ? "show-all" : "clr-white"
          }`}
        >
          {showFavorites ? "Show All Songs" : "Liked Songs"}
        </h1>
      </div>

      <div className="playlist-section">
        {storeGetPlaylist.map((i, index) => (
          <div
            className="playlist-section-div"
            key={index}
            onClick={() => {
              handlePlaylistTrack(i.name);
              setActivePlaylist(i.name); // Set clicked playlist
            }}
          >
            <h1
              className={`like-section-title ${
                activePlaylist === i.name ? "like-section-title" : " clr-white"
              }`}
            >
              {i.name}
            </h1>
            <img
              className="trash-icon-white playback-play-icon  "
              src={trashIcon}
              alt=""
              onClick={() => handleDeletePlaylist(i.name)}
            />
          </div>
        ))}
      </div>

      <div className="playlist-section-border"></div>

      {activeUsers.length > 0 && <Activeusers />}
      <div
        className={`product-wrapper ${
          searchTerm.trim() !== "" || showFavorites
            ? "product-wrapper-search"
            : ""
        }`}
      >
        {Array.isArray(displayData) && displayData.length > 0 ? (
          displayData.map((item, index) => (
            <div
              key={item._id}
              className={`product-box ${
                isPlaying && playingTrackTitle === item.title
                  ? "playing-box"
                  : ""
              }`}
            >
              <div className="product-image-container">
                <img
                  src={item.image}
                  alt={item.title}
                  className="product-image"
                  onClick={() => {
                    handlePlay(index, item.title, item.singer, item._id);
                    setSelectedTrackId(item._id);
                  }}
                />
                <AnimatePresence>
                  <motion.div
                    className={`${
                      isPlaying && playingTrackTitle === item.title
                        ? "image-wrapper"
                        : ""
                    }`}
                    initial={{
                      opacity:
                        isPlaying && playingTrackTitle === item.title ? 1 : 0,
                    }}
                    animate={{
                      opacity:
                        isPlaying && playingTrackTitle === item.title ? 1 : 0,
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {playingTrackTitle === item.title ? (
                      isPlaying ? (
                        <img
                          src={pauseIcon}
                          alt="Pause"
                          className="play-button play-button-visible"
                          onClick={() =>
                            handlePlay(index, item.title, item.singer, item._id)
                          }
                        />
                      ) : (
                        <img
                          src={playIcon}
                          alt="Play"
                          className="play-button play-button-visible"
                          onClick={() =>
                            handlePlay(index, item.title, item.singer, item._id)
                          }
                        />
                      )
                    ) : null}
                  </motion.div>
                </AnimatePresence>
              </div>
              <h3 className="product-title">{item.title}</h3>
              <h6
                className={`product-by ${
                  playingTrackTitle === item.title ? "playing-text" : ""
                }`}
              >
                By {item.singer}
              </h6>
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
            {/* <AnimatePresence mode="wait">
                <motion.img
                  onClick={handleFavorite}
                  key={isFavorite ? "filled" : "outline"}
                  src={isFavorite ? fillIcon : favoriteIcon}
                  alt="Favorite"
                  className="like-icon"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </AnimatePresence> */}
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

            <AnimatePresence mode="wait">
              <motion.img
                onClick={handleFavorite}
                key={
                  currentTrack === null
                    ? "default"
                    : isFavorite
                    ? "filled"
                    : "outline"
                }
                src={
                  currentTrack === null
                    ? favoriteIcon
                    : isFavorite
                    ? fillIcon
                    : favoriteIcon
                }
                alt="Favorite"
                className="favorite-icon"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            </AnimatePresence>

            {removeTrack ? (
              <img
                src={removeIcon}
                alt=""
                className="playlist-add-icon"
                onClick={() => {
                  handlRemoveFromPlaylist();
                }}
              />
            ) : (
              <img
                src={addSvg}
                alt=""
                className="playlist-add-icon"
                onClick={() => {
                  handleAddTrackToPlaylist(playingTrackTitle);
                  handleAddPlaylist();
                }}
              />
            )}
          </div>
          {/* Track  Title and Singer   */}
          {isPlayback && playingTrackTitle && (
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
        {roomStatus && (
          <motion.div
            key="room-status-modal" // ✅ Add this
            className="auth-overlay"
            onClick={closeRoomStatus}
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
              <h2 style={{ color: "#333" }}>Room Status</h2>{" "}
              <button className="join-btn" onClick={handleCreateRoom}>
                Create Room
              </button>
              <button className="cancel-btn" onClick={handleJoinRoom}>
                Join Room
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Product;
