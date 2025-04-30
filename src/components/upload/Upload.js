import React, { useState } from "react";
import axios from "axios";
import "./upload.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Upload = () => {
  const [title, setTitle] = useState("");
  const [singer, setSinger] = useState("");
  const [image, setImage] = useState(null);
  const [audio, setAudio] = useState(null);
  // const [msg, setMsg] = useState("");

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!title || !singer || !image || !audio) {
      toast.error("All fields are required!");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("singer", singer);
    formData.append("image", image);
    formData.append("audio", audio);

    try {
      const token = localStorage.getItem("token"); // Admin token
      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_API}/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (res.status === 201) {
        setTitle("");
        setSinger("");
        setImage(null);
        setAudio(null);
        toast.success("Upload successful! 🎶");
      }
    } catch (err) {
      console.error("Upload error:", err);
      if (err.response && err.response.data?.error) {
        toast.error(err.response.data.error);
      } else {
        toast.error("Upload failed! 🎶");
      }
    }
  };

  return (
    <div className="upload-container">
      <form className="upload-form" onSubmit={handleUpload}>
        <h2 className="upload-form-title">Upload New Track</h2>

        <input
          type="text"
          placeholder="Track Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Singer Name"
          value={singer}
          onChange={(e) => setSinger(e.target.value)}
          required
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          required
        />

        <input
          type="file"
          accept="audio/*"
          onChange={(e) => setAudio(e.target.files[0])}
          required
        />

        <button type="submit">Upload</button>
      </form>
    </div>
  );
};

export default Upload;
