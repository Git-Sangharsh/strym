import React, { useEffect, useState } from "react";
import "./hero.css";
import axios from "axios";

const Hero = () => {

  const [trackThumbnail, setTrackThumbnail] = useState([]);

  useEffect(() => {
    const fetchThumbnail = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_API}/tracks`);
        const allTracks = response.data;

        // Shuffle array
        const shuffled = allTracks.sort(() => 0.5 - Math.random());

        //first 4 random tracks
        const randomFour = shuffled.slice(0, 4);

        setTrackThumbnail(randomFour);
        console.log("Random Thumbnail:", randomFour);
      } catch (error) {
        console.error("Error fetching thumbnails:", error);
      }
    };

    fetchThumbnail();
  }, []);
  return (
    <div className="hero-container">
      <div className="hero-inner-container">
        <h1 className="hero-title">Strym For Beasts!</h1>
        <div className="hero-bg"></div>
      </div>

      <div className="hero-container-box">
        <div className="hero-inner-container-box">
          {/* Replacing Image with hero-box */}
          {/* <div className="hero-box"></div>
                    <div className="hero-box"></div>
                    <div className="hero-box"></div>
                    <div className="hero-box"></div> */}
          {trackThumbnail.map((i) => (
            <div className="hero-box">
              <img
                src={`${process.env.REACT_APP_BACKEND_API}${i.image}`}
                alt={i.title}
                className="hero-box"
              />{" "}
            </div>
          ))}
        </div>
      </div>

      <div className="hero-browse-container">
        <h6 className="hero-browse">
          Experience Nonstop Music Anytime, Anywhere — 100% Free Only on STRYM.
        </h6>
      </div>
    </div>
  );
};

export default Hero;
