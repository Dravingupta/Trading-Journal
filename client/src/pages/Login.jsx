// client/src/pages/Login.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  auth,
  signInWithGooglePopup,
  sendMagicLink,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "../firebase/firebase";
import { updateProfile } from "firebase/auth";
import api from "../api/api";
import "../App.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Handle coming back from magic email link
  useEffect(() => {
    const completeEmailSignIn = async () => {
      try {
        if (isSignInWithEmailLink(auth, window.location.href)) {
          let storedEmail = window.localStorage.getItem("emailForSignIn");

          if (!storedEmail) {
            storedEmail = window.prompt("Please confirm your email to complete login:");
          }

          if (!storedEmail) return;

          const result = await signInWithEmailLink(
            auth,
            storedEmail,
            window.location.href
          );

          // If this was sign-up flow, set displayName once
          const signupName = window.localStorage.getItem("signupName");
          if (signupName) {
            try {
              await updateProfile(result.user, { displayName: signupName });
            } catch (e) {
              console.error("Failed to update displayName:", e);
            }
            window.localStorage.removeItem("signupName");
          }

          window.localStorage.removeItem("emailForSignIn");

          const token = await result.user.getIdToken();
          localStorage.setItem("token", token);

          navigate("/");
        }
      } catch (err) {
        console.error("Email link completion error:", err);
        setError("❌ Failed to complete email login. Try sending a new link.");
      }
    };

    completeEmailSignIn();
  }, [navigate]);

  const handleSendMagicLink = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    try {
      // 1️⃣ Check with backend if this email is already registered
      const { data } = await api.post("/auth/check-email", { email });

      if (!data.exists) {
        setError("❌ No account found with this email. Please sign up first.");
        setLoading(false);
        return;
      }

      // 2️⃣ Email exists → send login link
      await sendMagicLink(email);
      window.localStorage.setItem("emailForSignIn", email);
      setInfo("✅ Login link sent! Please check your email inbox.");
    } catch (err) {
      console.error("Send magic link error:", err);
      setError("❌ Failed to send login link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setInfo("");
    setGoogleLoading(true);
    try {
      const result = await signInWithGooglePopup();
      console.log("Google user:", result.user.email);

      const token = await result.user.getIdToken();
      localStorage.setItem("token", token);

      navigate("/");
    } catch (err) {
      console.error("Google Login Error:", err);
      setError("❌ Failed to log in with Google.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <h2>🔑 Log In to Trading Journal</h2>
        <p className="header-subtext">Use a magic link or Google to access your trades.</p>

        <form onSubmit={handleSendMagicLink}>
          <div className="form-section">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>

          {error && (
            <p
              className="error-message"
              style={{ color: "red", marginTop: "10px" }}
            >
              {error}
            </p>
          )}
          {info && (
            <p
              className="info-message"
              style={{ color: "green", marginTop: "10px" }}
            >
              {info}
            </p>
          )}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Sending link..." : "Send login link"}
          </button>
        </form>

        {/* Divider */}
        <div style={{ margin: "20px 0", textAlign: "center" }}>
          <span>or</span>
        </div>

        {/* Google Login Button (styled like other sites) */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          style={{
            width: "100%",
            padding: "10px 16px",
            borderRadius: "6px",
            border: "1px solid #ddd",
            backgroundColor: "#ffffff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            fontWeight: 500,
          }}
        >
          <img
  src="https://developers.google.com/identity/images/g-logo.png"
  alt="Google Icon"
  style={{ width: 20, height: 20 }}
/>
          <span>
            {googleLoading ? "Connecting to Google..." : "Continue with Google"}
          </span>
        </button>

        <p style={{ marginTop: "20px", textAlign: "center" }}>
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
