import React, { useState } from "react";
import axios from "axios";
import "./admin.css";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Admin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  // const [msg, setMsg] = useState("");

  const handleUpload = () => {
    navigate("/admin/upload");
  };

  const handleTrash = () => {
    navigate("/admin/trash");
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_API}/admin-login`,
        {
          email,
          password,
        }
      );

      const { token } = response.data;
      // setMsg("Login successful!");
      setIsAdmin(true);
      toast.success("Login successful! 🎶");

      localStorage.setItem("token", token); // Store the JWT token
    } catch (error) {
      console.error("Login error:", error);
      if (error.response && error.response.data && error.response.data.error) {
        // setMsg(error.response.data.error);
        setIsAdmin(false);
        toast.error("Login failed");
      } else {
        // setMsg("Login failed");
        setIsAdmin(false);
        toast.error("Login failed");
      }
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-wrapper">
        <form className="admin-form" onSubmit={handleLogin}>
          <h2>Admin Login</h2>
          <input
            type="email"
            placeholder="Admin Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Admin Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">LOGIN</button>
          {/* <p className="admin-msg">{msg}</p> */}
          {isAdmin && (
            <div className="admin-btns">
              <button
                className="
          admin-btn"
                onClick={handleTrash}
              >
                TRASH
              </button>
              <button
                className="
          admin-btn"
                onClick={handleUpload}
              >
                UPLOAD
              </button>
            </div>
          )}
        </form>
      </div>
      <ToastContainer position="bottom-right" autoClose={6000} />
    </div>
  );
};

export default Admin;
