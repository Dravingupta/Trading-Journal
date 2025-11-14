// client/src/components/AuthHeader.jsx
import React from "react";
import "../App.css";

const AuthHeader = () => {
  return (
    <header className="auth-header">
      <div className="auth-header-inner">
        <h1>📊 My Trading Journal</h1>
        <p className="header-subtext">
          Track your trades with precision and clarity
        </p>
      </div>
    </header>
  );
};

export default AuthHeader;
