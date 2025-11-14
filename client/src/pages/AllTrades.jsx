// client/src/pages/AllTrades.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from "../api/api";
import Sidebar from '../components/Sidebar';
import '../App.css';

// Helper function for grouping and rendering
const groupTradesByDate = (trades) => {
  return trades.reduce((acc, trade) => {
    const dateObj = new Date(trade.date);
    const dateStr = dateObj.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    if (!acc[dateStr]) {
      acc[dateStr] = [];
    }
    acc[dateStr].push(trade);
    return acc;
  }, {});
};

const AllTrades = () => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const response = await api.get("/trades"); // just the path
        setTrades(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Fetch Trades Error:", err);
        setError(
          "Failed to fetch trades. Please ensure the server is running and you are logged in."
        );
        setLoading(false);
      }
    };
    fetchTrades();
  }, []);

  if (loading) return <div>Trades loading...</div>;
  if (error) return <div style={{ color: "red", padding: "20px" }}>Error: {error}</div>;

  const groupedTrades = groupTradesByDate(trades);

  return (
    <div className="layout">
      <Sidebar />

      <div className="main-content" id="main">
        <div className="container">
          {Object.keys(groupedTrades).length === 0 && (
            <p style={{ textAlign: "center", marginTop: "50px" }}>
              No trades found. Start adding your first trade! ➕
            </p>
          )}

          {Object.keys(groupedTrades).map((date) => (
            <div className="date-block" key={date}>
              <h2 className="date-heading">🗓 {date}</h2>

              <div className="trade-list">
                {groupedTrades[date].map((trade) => {
                  const pnlColor = trade.pnl >= 0 ? "#4CAF50" : "#F44336";
                  const pnlSymbol = trade.pnl >= 0 ? "+" : "";
                  const sideColor = trade.side === "SELL" ? "#F44336" : "#4CAF50";
                  const cardClass = trade.side === "SELL" ? "sell" : "buy";

                  let ratingColorClass = "";
                  if (trade.rating < 5) ratingColorClass = "low-rating";
                  else if (trade.rating < 9) ratingColorClass = "mid-rating";
                  else ratingColorClass = "high-rating";

                  return (
                    <Link
                      to={`/${trade._id}`}
                      className={`trade-card ${cardClass}`}
                      key={trade._id}
                    >
                      <div className="top-row">
                        <span style={{ color: sideColor, fontWeight: "bold" }}>
                          {trade.side}
                        </span>
                        <span
                          style={{
                            fontWeight: 600,
                            color: "#6d4c41",
                            backgroundColor: "#f9f1e7",
                            padding: "2px 8px",
                            borderRadius: 6,
                          }}
                        >
                          {trade.symbol.toUpperCase()}
                        </span>
                        <span>
                          {new Date(trade.date).toLocaleDateString("en-IN")}
                        </span>
                      </div>

                      <div className="summary-row">
                        <span style={{ color: pnlColor }}>
                          ₹ {pnlSymbol + trade.pnl.toFixed(2)}
                        </span>
                        <span
                          style={{
                            backgroundColor: "#f9f1e7",
                            color: "#6d4c41",
                            padding: "2px 8px",
                            borderRadius: 6,
                            fontSize: 12,
                          }}
                        >
                          {trade.stratagy}
                        </span>
                      </div>

                      <div className="rating-bar-container">
                        <div
                          className={`rating-bar-fill ${ratingColorClass}`}
                          style={{ width: `${trade.rating * 10}%` }}
                        >
                          <span className="rating-number">{trade.rating}/10</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AllTrades;
