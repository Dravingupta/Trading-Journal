// client/src/pages/TradeDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/api';
import Sidebar from '../components/Sidebar.jsx';
import '../App.css';

const formatNum = (num) => {
  if (num === null || num === undefined || isNaN(num)) return "N/A";
  return Number(num).toFixed(2);
};


const TradeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trade, setTrade] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrade = async () => {
      try {
        const response = await api.get(`/trades/${id}`);
        setTrade(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Fetch Trade Error:", err);
        setError('Failed to fetch trade details. Trade may not exist or access denied.');
        setLoading(false);
      }
    };
    fetchTrade();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("⚠️ Are you sure you want to delete this trade?")) {
      return;
    }

    try {
      await api.delete(`/trades/${id}`);
      alert("✅ Trade deleted successfully!");
      navigate('/');
    } catch (err) {
      console.error("Delete Trade Error:", err);
      setError(`❌ Failed to delete trade: ${err.message}`);
    }
  };

  if (loading) return <div>Loading trade details... ⏳</div>;
  if (error) return <div style={{ color: 'red', padding: '20px' }}>Error: {error}</div>;
  if (!trade) return <div style={{ padding: '20px' }}>Trade not found.</div>;

  const riskReward =
    trade.reward && trade.risk && trade.risk !== 0
      ? (trade.reward / trade.risk).toFixed(2)
      : "N/A";

  const pnlColor = trade.pnl >= 0 ? '#4CAF50' : '#F44336';
  const pnlSymbol = trade.pnl >= 0 ? '+' : '';
  const cardClass = trade.side === "SELL" ? "sell" : "buy";
  const isProfit = trade.pnl >= 0;
  const borderColor = isProfit ? '#4CAF50' : '#F44336';

  let ratingGradient = "";
  if (trade.rating <= 4)
    ratingGradient = "linear-gradient(to right, #F44336, #F44336)";
  else if (trade.rating <= 8)
    ratingGradient = "linear-gradient(to right, #4CAF50, #4CAF50)";
  else
    ratingGradient = "linear-gradient(to right, #FFD700, #FFD700)";

  return (
    <div className="layout">
      <Sidebar />
      {/* 👇 add trade-detail-page here */}
      <div className="main-content trade-detail-page" id="main">
        <header className="header analytics-header">
          <h1>📊 Trade Detail: {trade.symbol.toUpperCase()}</h1>
          <p className="header-subtext">Detailed review of your trade performance</p>
        </header>

        <div className="container">
          <div
            className={`trade-card ${cardClass} ${isProfit ? 'profit' : 'loss'}`}
            style={{ borderLeftColor: borderColor }}
          >
            <div className="trade-header">
              <div className="full-rating-bar">
                <div
                  className="rating-bar"
                  style={{
                    width: `${(trade.rating / 10) * 100}%`,
                    background: ratingGradient,
                  }}
                >
                  <span className="rating-label">
                    Rating: {trade.rating} / 10
                  </span>
                </div>
              </div>

              <div className="trade-info">
                <span>
                  <strong>Side:</strong>{" "}
                  <span className={`highlight ${cardClass}`}>{trade.side}</span>
                </span>
                <span>
                  <strong>Symbol:</strong>{" "}
                  <span className="accent-color">
                    {trade.symbol.toUpperCase()}
                  </span>
                </span>
                <span>
                  <strong>Strategy:</strong>{" "}
                  <span className="accent-color">{trade.stratagy}</span>
                </span>
                <span>
                  <strong>Date:</strong>{" "}
                  <span className="accent-color">
                    {new Date(trade.date).toLocaleDateString("en-IN")}
                  </span>
                </span>
              </div>
            </div>

            <div className="trade-row highlight-row">
              <span className="big-highlight" style={{ color: pnlColor }}>
                PNL: ₹ {pnlSymbol + trade.pnl.toFixed(2)}
              </span>
              <span className="big-highlight accent-color">
                R:R: {riskReward}
              </span>
            </div>

            <div className="trade-row">
              <span>
                <strong>Capital Used:</strong>{" "}
                <span className="accent-color">
                  ₹ {trade.capitalused.toFixed(2)}
                </span>
              </span>
              <span>
                <strong>Quantity:</strong>{" "}
                <span className="accent-color">{trade.quantity}</span>
              </span>
              <span>
                <strong>Reward:</strong>{" "}
                <span className="reward-color">
                  ₹{trade.reward.toFixed(2)} ({trade.reward_percent.toFixed(2)}%)
                </span>
              </span>
              <span>
                <strong>Risk:</strong>{" "}
                <span className="risk-color">
                  ₹{trade.risk.toFixed(2)} ({trade.risk_percent.toFixed(2)}%)
                </span>
              </span>
            </div>

            <div className="trade-row">
              <span>
                <strong>Entry Price:</strong>{" "}
                <span className="accent-color">₹ {formatNum(trade.price)}</span>
              </span>
              <span>
                <strong>Exit Price:</strong>{" "}
                <span className="accent-color">₹ {formatNum(trade.exit)}</span>
              </span>
              <span>
                <strong>Target:</strong>{" "}
                <span className="reward-color">₹ {formatNum(trade.target)}</span>
              </span>
              <span>
                <strong>Stoploss:</strong>{" "}
                <span className="risk-color">₹ {formatNum(trade.stoploss)}</span>
              </span>
            </div>

            <div className="trade-description-pair">
              <div className="trade-description-box">
                <strong>Entry Reason:</strong>
                <p>{trade.description}</p>
              </div>
              <div className="trade-description-box">
                <strong>Exit Reason:</strong>
                <p>{trade.exitreason}</p>
              </div>
            </div>

            <div className="action-buttons">
              <Link to={`/${trade._id}/edit`} className="btn edit-btn">
                ✏️ Edit
              </Link>
              <button onClick={handleDelete} className="btn delete-btn">
                🗑️ Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeDetail;
