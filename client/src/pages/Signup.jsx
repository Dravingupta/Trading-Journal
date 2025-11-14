// client/src/pages/Signup.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { sendMagicLink, signInWithGooglePopup } from "../firebase/firebase";
import "../App.css";

const SignupPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    try {
      // 1️⃣ Send magic sign-up link
      await sendMagicLink(email);

      // 2️⃣ Store email + name so login page can attach name to Firebase user
      window.localStorage.setItem("emailForSignIn", email);
      window.localStorage.setItem("signupName", name);

      setInfo("✅ Sign-up link sent! Check your email to finish creating your account.");
    } catch (err) {
      console.error("Signup Magic Link Error:", err);
      setError("❌ Failed to send sign-up link. Please check the email and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError("");
    setInfo("");
    setGoogleLoading(true);
    try {
      const result = await signInWithGooglePopup();
      console.log("Google user (signup):", result.user.email);

      const token = await result.user.getIdToken();
      localStorage.setItem("token", token);

      navigate("/");
    } catch (err) {
      console.error("Google Signup Error:", err);
      setError("❌ Failed to sign up with Google.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <h2>Create Account</h2>
        <p className="header-subtext">
          Enter your name and email, or use Google to get started.
        </p>

        <form onSubmit={handleSignup}>
          <div className="form-section">
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter your name"
            />
          </div>

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
            {loading ? "Sending link..." : "Send sign-up link"}
          </button>
        </form>

        {/* Divider */}
        <div style={{ margin: "20px 0", textAlign: "center" }}>
          <span>or</span>
        </div>

        {/* Google Sign Up Button */}
        <button
          type="button"
          onClick={handleGoogleSignup}
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
            {googleLoading ? "Connecting to Google..." : "Sign up with Google"}
          </span>
        </button>

        <p style={{ marginTop: "20px", textAlign: "center" }}>
          Already have an account? <Link to="/login">Log In</Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
