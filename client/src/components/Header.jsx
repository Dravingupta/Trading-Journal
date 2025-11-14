// client/src/components/Header.jsx
import React from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../App';

export default function Header() {
  const { user } = useAuth();

  const getDisplayName = () => {
    if (!user) return '';
    return (
      user.displayName ||
      user.email ||
      user.phoneNumber ||
      "User"
    );
  };

 

  return (
    <div className="container-header">
    <header className="header header-top">
      <div className="header-left">
        <h1>📊 My Trading Journal</h1>
        <p className="header-subtext">Track your trades with precision</p>
      </div>

      <div className="header-right">
        {user ? (
          <>
            <span>
              Hi, <strong>{getDisplayName()} ! </strong>
            </span>
            
          </>
        ) : (
          <>
            <Link to="/login" className="btn">Login</Link>
            <Link to="/signup" className="btn">Sign up</Link>
          </>
        )}
      </div>
    </header>
    </div>
  );
}
