import React from "react";
import "../App.css";

const LandingFooter = () => {
  return (
    <footer className="landing-footer">
      <div className="footer-content">
        <p className="footer-text">
          Made with ❤️ by <strong>Dravin Gupta</strong>
        </p>

        <div className="footer-links">
          <a
            href="https://drg-rho.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            🌐 Portfolio
          </a>

          <a
            href="https://www.linkedin.com/in/dravingupta"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            💼 LinkedIn
          </a>


        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
