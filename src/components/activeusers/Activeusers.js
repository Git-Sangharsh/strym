import React from 'react'
import "./Activeusers.css"
import { useSelector } from 'react-redux';

const Activeusers = () => {
    // const users = ["Sangharsh", "Amit", "Riya", "Zoya"];

    const activeUsers = useSelector((state) => state.activeUsers);
    return (
        <div className='active-users-container'>

      <div className="active-users-card">
        <h4>👥 Active Members Inside Room</h4>
        <ul>
          {activeUsers.map((user, index) => (
            <li key={index}>
              <span className="status-dot" /> {user}
            </li>
          ))}
        </ul>
      </div>
      </div>

    );
  };

export default Activeusers