import React, { useState, useEffect, useRef, useCallback } from 'react';
import GlobalLoader from './GlobalLoader';


// Messages to rotate
const LOADING_MESSAGES = [
    "Waking up trading engine...",
    "Syncing market data...",
    "Establishing secure connection...",
    "Calibrating charts...",
    "Loading trade history..."
];

const BackendWakeLoader = ({ onFinish }) => {
    const [textIndex, setTextIndex] = useState(0);
    const healthCheckInterval = useRef(null);
    const isMounted = useRef(true);

    // Text Rotation Interval
    useEffect(() => {
        isMounted.current = true;
        const textInterval = setInterval(() => {
            setTextIndex(prev => (prev + 1) % LOADING_MESSAGES.length);
        }, 3000);

        return () => {
            isMounted.current = false;
            clearInterval(textInterval);
            if (healthCheckInterval.current) clearInterval(healthCheckInterval.current);
        };
    }, []);


    const finishLoader = useCallback(() => {
        if (onFinish) onFinish();
    }, [onFinish]);

    // Backend Health Check Logic
    useEffect(() => {
        const checkBackend = async () => {
            try {
                const apiUrl = process.env.REACT_APP_API_URL || '';
                if (!apiUrl) {
                    finishLoader();
                    return;
                }

                // Use no-cors mode. 
                await fetch(apiUrl, { mode: 'no-cors' });

                // If fetch succeeds (does not throw), the server is reachable.
                if (isMounted.current) finishLoader();
            } catch (error) {
                // Fetch only throws on network failure
                console.log("Waiting for backend...");
            }
        };

        // Initial check
        checkBackend();

        // Poll every 2 seconds
        healthCheckInterval.current = setInterval(checkBackend, 2000);

        // Safety Timeout (60 seconds)
        const timeoutId = setTimeout(() => {
            console.log("Backend wake timeout - forcing entry.");
            if (isMounted.current) finishLoader();
        }, 60000);

        return () => clearTimeout(timeoutId);
    }, [finishLoader]);


    return (
        <GlobalLoader message={LOADING_MESSAGES[textIndex]} />
    );
};

export default BackendWakeLoader;
