
import React
from 'react';
import './footer.css';
import whatsapp from '../assets/whatsapp.svg';
import youtube from '../assets/youtube.svg';
import instagram from '../assets/instagram.svg';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';


const Footer = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const toggleSuggest = () => {
    dispatch({ type: 'SET_SHOW_SUGGEST' });
  };

  const handleAdmin = () => {
    navigate("/admin")
  };

  const handleAuth = () =>  {
    dispatch({ type: 'SET_SHOW_GOOGLE_AUTH' });
  };

  const handleShowPlaylist = ()  => {
    dispatch({ type: 'TOGGLE_ADD_PLAYLIST' });

  }

  return (
    <div  className='footer-container'>
        <div className="footer-wrapper">

        <div className="footer-left">
            <h1 className='footer-left-title'>STRYM</h1>
            <h6 className='footer-left-description'>Discover free, high-quality sound on Strym — no ads, no interruptions, just pure sound.</h6>
            <h6 className='footer-left-description'>Silence the noise. Strym delivers music that speaks.</h6>

            <div className="footer-left-social">
            <h4 className='footer-right-link' onClick={toggleSuggest} >Suggest Music</h4>
            <h4 className='footer-right-link' onClick={handleAuth}>Auth</h4>
            <h4 className='footer-right-link' onClick={handleShowPlaylist}>show  Playlist</h4>
            <h4 className='footer-right-link' onClick={handleAdmin}>Admin</h4>
            <h4 className='footer-right-link'>Contact Us</h4>
            <h4 className='footer-right-link'>About Us</h4>
            </div>
            {/* <h6 className='footer-left-description'>© 2025 P-Beats. All rights reserved.</h6> */}
            <div className="footer-left-social">
                <img className='social-icon insta' src={instagram} alt="instagram" />
                <img className='social-icon whatsapp' src={whatsapp} alt="whatsapp" />
                <img className='social-icon  youtube' src={youtube} alt="youtube" />
            </div>
        </div>
        <div className="footer-right">

        </div>
        </div>
    </div>
  )
}

export default Footer;