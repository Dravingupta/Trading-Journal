// client/src/pages/LandingPage.jsx
import React from "react";
import { Link } from "react-router-dom";
import "../App.css";

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Top header for landing (no sidebar, no auth needed) */}
      <header className="landing-header">
        <div className="landing-header-left">
          <span className="landing-logo">📊</span>
          <div className="landing-brand-text">
            <span className="landing-title">My Trading Journal</span>
            <span className="landing-subtitle">
              Track your trades. Understand your edge.
            </span>
          </div>
        </div>

        <div className="landing-header-right">
          
          
        </div>
      </header>

      <main className="landing-main">
        {/* Hero section */}
        <section className="landing-hero">
          <div className="landing-hero-left">
            <h1 className="landing-hero-title">
              Turn every trade into{" "}
              <span className="landing-hero-highlight">data you can trust.</span>
            </h1>
            <p className="landing-hero-text">
              Log your entries, exits, strategies and PnL in one clean journal.
              See your win rate, equity curve and performance by strategy – all
              calculated automatically.
            </p>

            <div className="landing-hero-actions">
              <Link to="/signup" className="btn landing-primary-btn">
                Get started for free
              </Link>
              
            </div>

            <ul className="landing-bullets">
              <li>✅ Record trades with rating, reasons & strategy</li>
              <li>📊 Analytics dashboard with PnL, win rate & equity curve</li>
              <li>🎯 Strategy-wise breakdown to see what actually works</li>
            </ul>
          </div>

          {/* Fake preview card on the right */}
          <div className="landing-hero-right">
            <div className="landing-preview-card">
              <div className="landing-preview-header">
                <span className="landing-preview-title">Sample Performance</span>
                <span className="landing-preview-tag">Demo view</span>
              </div>

              <div className="landing-preview-stats">
                <div className="landing-preview-stat">
                  <span className="label">Net PnL</span>
                  <span className="value positive">₹ 18,450.00</span>
                  <span className="hint">Last 30 days</span>
                </div>
                <div className="landing-preview-stat">
                  <span className="label">Win rate</span>
                  <span className="value">62.5%</span>
                  <span className="hint">15 / 24 trades</span>
                </div>
                <div className="landing-preview-stat">
                  <span className="label">Best strategy</span>
                  <span className="value">Breakout R:R</span>
                  <span className="hint">₹ 12,300 net</span>
                </div>
              </div>

              {/* Mini fake equity curve */}
              <div className="landing-preview-chart">
                <div className="landing-preview-chart-line" />
                <div className="landing-preview-chart-dot landing-dot-1" />
                <div className="landing-preview-chart-dot landing-dot-2" />
                <div className="landing-preview-chart-dot landing-dot-3" />
                <div className="landing-preview-chart-dot landing-dot-4" />
              </div>

              <p className="landing-preview-footer">
                Your real dashboard is powered by your actual trades –
                automatically calculated from your journal.
              </p>
            </div>
          </div>
        </section>

        {/* Features section */}
        <section className="landing-features">
          <h2 className="landing-features-title">
            Built for traders who take journaling seriously
          </h2>

          <div className="landing-feature-grid">
            <div className="landing-feature-card">
              <span className="landing-feature-icon">📝</span>
              <h3>Structured trade logging</h3>
              <p>
                Capture side, symbol, entry, exit, risk, reward, rating and notes
                for every trade – with consistent fields so you can actually
                analyse later.
              </p>
            </div>

            <div className="landing-feature-card">
              <span className="landing-feature-icon">📈</span>
              <h3>Clean analytics dashboard</h3>
              <p>
                See your net PnL, average R:R, win rate, equity curve and best /
                worst trades in a single glance. No Excel formulas required.
              </p>
            </div>

            <div className="landing-feature-card">
              <span className="landing-feature-icon">🎯</span>
              <h3>Strategy performance</h3>
              <p>
                Group trades by strategy and immediately see what is making you
                money – and what is slowly bleeding your account.
              </p>
            </div>
          </div>
        </section>
      </main>

    </div>
  );
};

export default LandingPage;
