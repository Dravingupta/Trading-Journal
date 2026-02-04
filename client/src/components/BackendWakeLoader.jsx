import React, { useState, useEffect, useRef, useCallback } from 'react';
import './BackendWakeLoader.css';

// Reusing theme colors from trades.css
const BULL_COLOR = '#4CAF50';
const BEAR_COLOR = '#F44336';

// Messages to rotate
const LOADING_MESSAGES = [
    "Waking up trading engine...",
    "Syncing market data...",
    "Establishing secure connection...",
    "Calibrating charts...",
    "Loading trade history..."
];

const BackendWakeLoader = ({ onFinish }) => {
    const [candles, setCandles] = useState([]);
    const [textIndex, setTextIndex] = useState(0);
    const [isFading, setIsFading] = useState(false);

    // Ref to track if we are mounted (for intervals)
    const isMounted = useRef(true);
    const healthCheckInterval = useRef(null);

    const finishLoader = useCallback(() => {
        if (isFading) return;
        setIsFading(true);
        // Wait for fade out animation (0.8s) before unmounting
        setTimeout(() => {
            if (onFinish) onFinish();
        }, 800);
    }, [isFading, onFinish]);

    // Initialize random candles
    useEffect(() => {
        isMounted.current = true;

        // Create initial candles (7 bars)
        const initialCandles = Array.from({ length: 7 }).map(() => ({
            height: Math.random() * 80 + 20 + '%', // 20% to 100%
            color: Math.random() > 0.5 ? BULL_COLOR : BEAR_COLOR
        }));
        setCandles(initialCandles);

        // Animation Interval (update candles every 600ms)
        const animInterval = setInterval(() => {
            setCandles(prev => prev.map(c => {
                const isBullish = Math.random() > 0.4; // Slightly biased to bull ;)
                return {
                    height: Math.random() * 80 + 20 + '%',
                    color: isBullish ? BULL_COLOR : BEAR_COLOR
                };
            }));
        }, 600);

        // Text Rotation Interval (every 3s)
        const textInterval = setInterval(() => {
            setTextIndex(prev => (prev + 1) % LOADING_MESSAGES.length);
        }, 3000);

        // Cleanup
        return () => {
            isMounted.current = false;
            clearInterval(animInterval);
            clearInterval(textInterval);
            if (healthCheckInterval.current) clearInterval(healthCheckInterval.current);
        };
    }, []);

    // Backend Health Check Logic
    useEffect(() => {
        const checkBackend = async () => {
            try {
                const apiUrl = process.env.REACT_APP_API_URL || '';
                if (!apiUrl) {
                    finishLoader();
                    return;
                }

                // Use no-cors mode. This allows the request to complete even if the server
                // doesn't send the correct CORS headers (common in dev or simple setups).
                // The response will be 'opaque', but if we get ANY response, the server is awake.
                await fetch(apiUrl, { mode: 'no-cors' });

                // If fetch succeeds (does not throw), the server is reachable.
                finishLoader();
            } catch (error) {
                // Fetch only throws on network failure (server down/unreachable), which is what we want.
                console.log("Waiting for backend...");
            }
        };

        // Initial check
        checkBackend();

        // Poll every 2 seconds
        healthCheckInterval.current = setInterval(checkBackend, 2000);

        // Safety Timeout (60 seconds) - stop loader anyway so user isn't stuck forever
        const timeoutId = setTimeout(() => {
            console.log("Backend wake timeout - forcing entry.");
            finishLoader();
        }, 60000);

        return () => clearTimeout(timeoutId);
    }, [finishLoader]);


    return (
        <div className={`wake-loader-overlay ${isFading ? 'fade-out' : ''}`}>
            {/* Living Chart Visualization */}
            <div className="loader-graph-container">
                {candles.map((candle, idx) => (
                    <div
                        key={idx}
                        className="loader-candle"
                        style={{
                            height: candle.height,
                            backgroundColor: candle.color
                        }}
                    />
                ))}
            </div>

            {/* Rotating Status Text */}
            <div className="loader-text-container">
                <div className="loader-status-text">
                    {LOADING_MESSAGES[textIndex]}
                </div>
                <div className="loader-subtext">
                    Est. wait time: ~30s for cold start
                </div>
            </div>
        </div>
    );
};

export default BackendWakeLoader;
