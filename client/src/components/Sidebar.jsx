// client/src/components/Sidebar.jsx
import React, { useState } from "react";
import "../App.css";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;

      // desktop layout shift
      if (next) {
        document.body.classList.add("sidebar-collapsed");
      } else {
        document.body.classList.remove("sidebar-collapsed");
        
      }

      return next;
    });
  };

  async function handleLogout() {
    try {
      document.body.classList.remove("sidebar-collapsed");
      await signOut(auth);
      localStorage.removeItem("token");
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  }

  return  (
  <>
    {/* Overlay (shown only when expanded and on mobile) */}
    {isCollapsed === false && window.innerWidth <= 480 && (
      <div className="sidebar-overlay" onClick={toggleSidebar}></div>
    )}

    <aside className={`sidebar ${isCollapsed ? "collapsed" : ""}`} id="sidebar">
      <div className="sidebar-toggle-row">
        <button
          id="toggle-btn"
          className="toggle-btn"
          onClick={toggleSidebar}
          style={{
            transform: isCollapsed ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.3s ease",
          }}
        >
          ≡
        </button>
        <span className="sidebar-text sidebar-title-text">Journal</span>
      </div>

      <nav className="sidebar-links">
        <Link to="/trades">📋 <span className="sidebar-text">All Trades</span></Link>
        <Link to="/new">➕ <span className="sidebar-text">Add Trade</span></Link>
        <Link to="/analytics">📊 <span className="sidebar-text">Analytics</span></Link>
      </nav>

      <div className="sidebar-bottom">
        <button className="sidebar-logout-btn" onClick={handleLogout}>
          ➜] <span className="sidebar-text">Logout</span>
        </button>
      </div>
    </aside>
  </>
);
};

export default Sidebar;
