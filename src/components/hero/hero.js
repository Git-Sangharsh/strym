import React from 'react';
import './hero.css';
import apiResponse from '../api/api'; // Renamed to avoid conflict

const Hero = () => {
    // const [data, setData] = useState(apiResponse.slice(4, 8)); // Renamed state variable
    const data = apiResponse.slice(4, 8)

    return (
        <div className='hero-container'>

            <div className="hero-inner-container">
                <h1 className='hero-title'>Strym For Beasts!</h1>
                <div className='hero-bg'></div>
            </div>

            <div className="hero-container-box">
                <div className="hero-inner-container-box">
                    {/* Replacing Image with hero-box */}
                    {/* <div className="hero-box"></div>
                    <div className="hero-box"></div>
                    <div className="hero-box"></div>
                    <div className="hero-box"></div> */}
                    {data.map((i) => (
                        <div className="hero-box">
                            <img className='hero-box' src={i.beatImage} alt={i.beatType} />
                        </div>
                    ))}
                </div>
            </div>

            <div className='hero-browse-container'>
                <h6 className="hero-browse">
                    Experience Nonstop Music Anytime, Anywhere — 100% Free Only on STRYM.
                </h6>
            </div>

        </div>
    );
}

export default Hero;
