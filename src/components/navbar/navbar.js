import React, { useState, useEffect, useRef } from "react";
import "./navbar.css";
import ScrollIntoView from "react-scroll-into-view";
import { motion, useAnimation } from "framer-motion";

const Navbar = () => {
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const controls = useAnimation();
  const ticking = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.pageYOffset;

      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          if (prevScrollPos > currentScrollPos || currentScrollPos < 10) {
            // Scrolling up
            controls.start({
              y: 0,
              transition: { type: "tween", duration: 0.25, ease: "easeOut" },
            });
          } else {
            // Scrolling down
            controls.start({
              y: "-100%",
              transition: { type: "tween", duration: 0.25, ease: "easeOut" },
            });
          }

          setPrevScrollPos(currentScrollPos);
          ticking.current = false;
        });

        ticking.current = true;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollPos, controls]);

  return (
    <motion.div className="nav-container" initial={{ y: 0 }} animate={controls}>
      <div className="nav-wrapper">
        <div className="logo">
          <h5 className="nav-item">STRYM</h5>
        </div>
        <div className="nav-items">
          <ScrollIntoView selector="#tracks">
            <button className="nav-button">EXPLORE</button>
          </ScrollIntoView>
        </div>
      </div>
    </motion.div>
  );
};

export default Navbar;
