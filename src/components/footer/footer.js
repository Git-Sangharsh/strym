
import React from 'react';
import './footer.css';
import whatsapp from '../assets/whatsapp.svg';
import youtube from '../assets/youtube.svg';
import instagram from '../assets/instagram.svg';
import { useNavigate } from 'react-router-dom';

const Footer = () => {

  const navigate = useNavigate();

  const handleAdmin = () => {
    navigate("/admin")
  }

  return (
    <div  className='footer-container'>
        <div className="footer-wrapper">

        <div className="footer-left">
            <h1 className='footer-left-title'>STRYM</h1>
            <h6 className='footer-left-description'>Discover the best beats for your next project. Our beats are designed to help you create a unique and professional sound.</h6>
            <h6 className='footer-left-description'>Contact To Get Full Access To All Beats.</h6>

            <div className="footer-left-social">
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