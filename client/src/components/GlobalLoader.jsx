import React from 'react';
import './Loader.css';

const GlobalLoader = ({ message = "Loading...", fullScreen = true }) => {
    return (
        <div className={`loader-container ${fullScreen ? 'fullscreen' : 'inline'}`}>
            <div className="candles-animation">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="anim-candle" style={{ animationDelay: `${i * 0.1}s` }} />
                ))}
            </div>

            {message && <div className="loader-message-light">{message}</div>}
        </div>
    );
};

export default GlobalLoader;
