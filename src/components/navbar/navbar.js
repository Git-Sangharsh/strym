import React from "react";
import "./navbar.css";

const Navbar = () => {
  return (
    <div className="nav-container">
      <div className="nav-wrapper">
        <div className="logo">
          <h5 className="nav-item">STRYM</h5>
        </div>
        <div className="nav-items">
          <button className="nav-button">EXPLORE</button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
