import React, { useState } from 'react';
import axios from 'axios';
import './admin.css';
import { useNavigate } from 'react-router-dom';

const Admin = () => {

  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [msg, setMsg] = useState('');

  const handleUpload  = () => {
    navigate("/admin/upload");
  }

  const handleTrash  = () => {
    navigate("/admin/trash");
  }

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
      setMsg('Login successful!');
      setIsAdmin(true);
      localStorage.setItem('token', token); // Store the JWT token
    } catch (error) {
      console.error('Login error:', error);
      if (error.response && error.response.data && error.response.data.error) {
        setMsg(error.response.data.error);
        setIsAdmin(false);
      } else {
        setMsg('Login failed');
        setIsAdmin(false);
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

        <button type="submit">Login</button>
        <p className="admin-msg">{msg}</p>
        {isAdmin  && <div  className='admin-btns'>
          <button className='
          admin-btn' onClick={handleTrash}>Trash</button>
          <button className='
          admin-btn' onClick={handleUpload}>Upload</button>
          </div>}
        </form>
            </div>
    </div>
  );
};

export default Admin;
