// client/src/pages/Analytics.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import Sidebar from "../components/Sidebar";
import "../App.css";

const formatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(value)) return "-";
  return `₹ ${value.toFixed(2)}`;
};

const formatPercent = (value) => {
  if (value === null || value === undefined || isNaN(value)) return "-";
  return `${value.toFixed(1)}%`;
};

/**
 * Simple SVG line chart for equity curve
 * data: [{ date, cumulativePnl }]
 */
const EquityChart = ({ data }) => {
  if (!data || data.length === 0) return null;

  const width = 600;
  const height = 220;
  const padding = 30;

  const values = data.map((d) => d.cumulativePnl);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);

  const range = maxVal - minVal || 1;

  const points = data.map((d, index) => {
    const x =
      padding +
      (index / Math.max(data.length - 1, 1)) * (width - padding * 2);
    const normalized = (d.cumulativePnl - minVal) / range;
    const y = height - padding - normalized * (height - padding * 2);
    return { x, y };
  });

  const pathD = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(" ");

  const zeroY =
    height -
    padding -
    ((0 - minVal) / range) * (height - padding * 2);

  const showZeroLine = minVal < 0 && maxVal > 0;

  const lastPoint = points[points.length - 1];
  const lastValue = values[values.length - 1];

  return (
    <div className="analytics-chart-wrapper">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="analytics-chart-svg"
      >
        <rect
          x="0"
          y="0"
          width={width}
          height={height}
          fill="#fffaf5"
          rx="12"
        />

        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke="#d7c5b6"
          strokeWidth="1"
        />
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#d7c5b6"
          strokeWidth="1"
        />

        {showZeroLine && (
          <line
            x1={padding}
            y1={zeroY}
            x2={width - padding}
            y2={zeroY}
            stroke="#b0bec5"
            strokeDasharray="4 4"
            strokeWidth="1"
          />
        )}

        <path
          d={pathD}
          fill="none"
          stroke={lastValue >= 0 ? "#4CAF50" : "#F44336"}
          strokeWidth="2.2"
        />

        <path
          d={
            pathD +
            ` L ${points[points.length - 1].x} ${height - padding}` +
            ` L ${points[0].x} ${height - padding} Z`
          }
          fill={
            lastValue >= 0
              ? "rgba(76, 175, 80, 0.08)"
              : "rgba(244, 67, 54, 0.08)"
          }
        />

        {points.map((p, idx) => (
          <circle
            key={idx}
            cx={p.x}
            cy={p.y}
            r={idx === points.length - 1 ? 4 : 3}
            fill={idx === points.length - 1 ? "#ff9800" : "#6d4c41"}
          />
        ))}

        <text
          x={padding - 6}
          y={padding + 4}
          fontSize="10"
          textAnchor="end"
          fill="#8d6e63"
        >
          {formatCurrency(maxVal)}
        </text>
        <text
          x={padding - 6}
          y={height - padding}
          fontSize="10"
          textAnchor="end"
          fill="#8d6e63"
        >
          {formatCurrency(minVal)}
        </text>

        <g>
          <rect
            x={lastPoint.x + 6}
            y={lastPoint.y - 16}
            rx="4"
            ry="4"
            width="80"
            height="18"
            fill="#ffffff"
            stroke="#e0d4c8"
          />
          <text
            x={lastPoint.x + 10}
            y={lastPoint.y - 4}
            fontSize="10"
            fill="#6d4c41"
          >
            {formatCurrency(lastValue)}
          </text>
        </g>
      </svg>
      <div className="analytics-chart-caption">
        Equity curve (cumulative PnL over time)
      </div>
    </div>
  );
};

const AnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [byStrategy, setByStrategy] = useState([]);
  const [equityCurve, setEquityCurve] = useState([]);

  const [filters, setFilters] = useState({
    range: "30", // default: last 30 days
    from: "",
    to: "",
    strategy: "all",
    side: "all",
  });

  const [strategiesList, setStrategiesList] = useState([]);

  // Load strategies once (for dropdown)
  useEffect(() => {
    const fetchStrategies = async () => {
      try {
        const res = await api.get("/strategies");
        const names = (res.data || []).map((s) => s.name);
        setStrategiesList(names);
      } catch (err) {
        console.error("Error loading strategies list:", err);
      }
    };
    fetchStrategies();
  }, []);

  const fetchAnalytics = async (opts = {}) => {
    try {
      setLoading(true);
      setError(null);

      const activeFilters = { ...filters, ...opts };
      const params = {};

      if (activeFilters.from || activeFilters.to) {
        if (activeFilters.from) params.from = activeFilters.from;
        if (activeFilters.to) params.to = activeFilters.to;
      } else if (activeFilters.range && activeFilters.range !== "all") {
        params.range = activeFilters.range;
      } else {
        params.range = "all";
      }

      if (
        activeFilters.strategy &&
        activeFilters.strategy !== "all"
      ) {
        params.strategy = activeFilters.strategy;
      }

      if (activeFilters.side && activeFilters.side !== "all") {
        params.side = activeFilters.side;
      }

      const res = await api.get("/analytics", { params });

      if (!res.data.hasData) {
        setSummary(null);
        setByStrategy([]);
        setEquityCurve([]);
      } else {
        setSummary(res.data.summary);
        setByStrategy(res.data.byStrategy || []);
        setEquityCurve(res.data.equityCurve || []);
      }

      setFilters(activeFilters);
    } catch (err) {
      console.error("Analytics fetch error:", err);
      setError(
        "Failed to load analytics. Please check if the server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleQuickRange = (value) => {
    fetchAnalytics({
      range: value,
      from: "",
      to: "",
    });
  };

  const handleCustomDateChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
      range: "custom",
    }));
  };

  const applyCustomFilters = () => {
    fetchAnalytics({
      range: "custom",
    });
  };

  if (loading)
    return <div style={{ padding: 20 }}>Loading analytics... ⏳</div>;
  if (error)
    return (
      <div style={{ color: "red", padding: 20 }}>
        Error loading analytics: {error}
      </div>
    );

  return (
    <div className="layout">
      <Sidebar />

      <div className="main-content" id="main">
        <header className="header analytics-header">
          <h1>📈 Analytics Dashboard</h1>
          <p className="header-subtext">
            See how your trading performance evolves over time.
          </p>
        </header>

        <div className="container analytics-container">
          {/* Filters */}
          <section className="analytics-filters">
            <div className="filter-row">
              <div className="filter-group">
                <span className="filter-label">Date range:</span>
                <button
                  type="button"
                  className={
                    filters.range === "7"
                      ? "filter-chip active"
                      : "filter-chip"
                  }
                  onClick={() => handleQuickRange("7")}
                >
                  Last 7 days
                </button>
                <button
                  type="button"
                  className={
                    filters.range === "30"
                      ? "filter-chip active"
                      : "filter-chip"
                  }
                  onClick={() => handleQuickRange("30")}
                >
                  Last 30 days
                </button>
                <button
                  type="button"
                  className={
                    filters.range === "90"
                      ? "filter-chip active"
                      : "filter-chip"
                  }
                  onClick={() => handleQuickRange("90")}
                >
                  Last 90 days
                </button>
                <button
                  type="button"
                  className={
                    filters.range === "all"
                      ? "filter-chip active"
                      : "filter-chip"
                  }
                  onClick={() => handleQuickRange("all")}
                >
                  All
                </button>
              </div>

              <div className="filter-group">
                <span className="filter-label">Custom dates:</span>
                <input
                  type="date"
                  value={filters.from}
                  onChange={(e) =>
                    handleCustomDateChange("from", e.target.value)
                  }
                  className="filter-input"
                />
                <span style={{ fontSize: 12, color: "#8d6e63" }}>to</span>
                <input
                  type="date"
                  value={filters.to}
                  onChange={(e) =>
                    handleCustomDateChange("to", e.target.value)
                  }
                  className="filter-input"
                />
                <button
                  type="button"
                  className="filter-apply-btn"
                  onClick={applyCustomFilters}
                >
                  Apply
                </button>
              </div>
            </div>

            <div className="filter-row">
              <div className="filter-group">
                <span className="filter-label">Strategy:</span>
                <select
                  value={filters.strategy}
                  onChange={(e) =>
                    fetchAnalytics({ strategy: e.target.value })
                  }
                  className="filter-select"
                >
                  <option value="all">All strategies</option>
                  {strategiesList.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <span className="filter-label">Side:</span>
                <select
                  value={filters.side}
                  onChange={(e) =>
                    fetchAnalytics({ side: e.target.value })
                  }
                  className="filter-select"
                >
                  <option value="all">All</option>
                  <option value="BUY">BUY only</option>
                  <option value="SELL">SELL only</option>
                </select>
              </div>

              <div className="filter-summary">
                Showing:&nbsp;
                <strong>
                  {filters.range === "custom"
                    ? `${filters.from || "any"} → ${filters.to || "any"}`
                    : filters.range === "7"
                    ? "Last 7 days"
                    : filters.range === "30"
                    ? "Last 30 days"
                    : filters.range === "90"
                    ? "Last 90 days"
                    : "All time"}
                </strong>
                {filters.strategy !== "all" && (
                  <>
                    &nbsp;• Strategy: <strong>{filters.strategy}</strong>
                  </>
                )}
                {filters.side !== "all" && (
                  <>
                    &nbsp;• Side: <strong>{filters.side}</strong>
                  </>
                )}
              </div>
            </div>
          </section>

          {/* If no trades */}
          {!summary && (
            <div className="analytics-empty">
              <p>No trades match the current filters.</p>
              <p style={{ fontSize: 13, color: "#8d6e63" }}>
                Try expanding the date range or removing some filters.
              </p>
              <Link to="/new" className="btn edit-btn">
                ➕ Add a new trade
              </Link>
            </div>
          )}

          {summary && (
            <>
              {/* Top summary cards */}
              <section className="analytics-grid">
                <div className="stat-card">
                  <span className="stat-title">Net PnL</span>
                  <span
                    className={
                      summary.netPnl >= 0
                        ? "stat-value profit"
                        : "stat-value loss"
                    }
                  >
                    {formatCurrency(summary.netPnl)}
                  </span>
                  <span className="stat-subtext">
                    Profit: {formatCurrency(summary.totalProfit)} &nbsp; | &nbsp;
                    Loss: {formatCurrency(summary.totalLoss)}
                  </span>
                </div>

                <div className="stat-card">
                  <span className="stat-title">Win Rate</span>
                  <span className="stat-value">
                    {formatPercent(summary.winRate)}
                  </span>
                  <span className="stat-subtext">
                    {summary.winningTrades} wins / {summary.totalTrades} trades
                  </span>
                </div>

                <div className="stat-card">
                  <span className="stat-title">Average R:R</span>
                  <span className="stat-value">
                    {summary.avgRMultiple.toFixed(2)} R
                  </span>
                  <span className="stat-subtext">
                    Avg Risk: {formatCurrency(summary.avgRisk)} &nbsp; | &nbsp;
                    Avg Reward: {formatCurrency(summary.avgReward)}
                  </span>
                </div>

                <div className="stat-card">
                  <span className="stat-title">Average PnL / Trade</span>
                  <span
                    className={
                      summary.avgPnl >= 0
                        ? "stat-value profit"
                        : "stat-value loss"
                    }
                  >
                    {formatCurrency(summary.avgPnl)}
                  </span>
                  <span className="stat-subtext">
                    Total Trades: {summary.totalTrades}
                  </span>
                </div>
              </section>

              {/* Equity curve chart */}
              <section className="analytics-section">
                <h2 className="analytics-section-title">📊 Equity Curve</h2>
                {equityCurve.length === 0 ? (
                  <p>No equity data yet.</p>
                ) : (
                  <EquityChart data={equityCurve} />
                )}
              </section>

              {/* Best / Worst trades */}
              <section className="analytics-section">
                <h2 className="analytics-section-title">🏅 Best & Worst Trades</h2>
                <div className="analytics-grid two-cols">
                  <div className="stat-card trade-highlight">
                    <span className="stat-title">Best Trade</span>
                    {summary.bestTrade ? (
                      <>
                        <span className="trade-symbol">
                          {summary.bestTrade.symbol.toUpperCase()}
                        </span>
                        <span className="stat-value profit">
                          {formatCurrency(summary.bestTrade.pnl)}
                        </span>
                        <span className="stat-subtext">
                          {summary.bestTrade.stratagy} •{" "}
                          {summary.bestTrade.side} •{" "}
                          {new Date(
                            summary.bestTrade.date
                          ).toLocaleDateString("en-IN")}
                        </span>
                        <Link
                          to={`/${summary.bestTrade._id}`}
                          className="small-link"
                        >
                          View trade →
                        </Link>
                      </>
                    ) : (
                      <p>No trade data</p>
                    )}
                  </div>

                  <div className="stat-card trade-highlight">
                    <span className="stat-title">Worst Trade</span>
                    {summary.worstTrade ? (
                      <>
                        <span className="trade-symbol">
                          {summary.worstTrade.symbol.toUpperCase()}
                        </span>
                        <span className="stat-value loss">
                          {formatCurrency(summary.worstTrade.pnl)}
                        </span>
                        <span className="stat-subtext">
                          {summary.worstTrade.stratagy} •{" "}
                          {summary.worstTrade.side} •{" "}
                          {new Date(
                            summary.worstTrade.date
                          ).toLocaleDateString("en-IN")}
                        </span>
                        <Link
                          to={`/${summary.worstTrade._id}`}
                          className="small-link"
                        >
                          View trade →
                        </Link>
                      </>
                    ) : (
                      <p>No trade data</p>
                    )}
                  </div>
                </div>
              </section>

              {/* Strategy breakdown */}
              <section className="analytics-section">
                <h2 className="analytics-section-title">
                  🎯 Performance by Strategy
                </h2>

                {byStrategy.length === 0 ? (
                  <p style={{ padding: "10px 0" }}>
                    No strategy data for these filters.
                  </p>
                ) : (
                  <div className="strategy-table-wrapper">
                    <table className="strategy-table">
                      <thead>
                        <tr>
                          <th>Strategy</th>
                          <th>Trades</th>
                          <th>Win Rate</th>
                          <th>Net PnL</th>
                          <th>Avg PnL</th>
                          <th>Profit</th>
                          <th>Loss</th>
                        </tr>
                      </thead>
                      <tbody>
                        {byStrategy.map((s) => (
                          <tr key={s.stratagy}>
                            <td>{s.stratagy}</td>
                            <td>{s.trades}</td>
                            <td>{formatPercent(s.winRate)}</td>
                            <td
                              className={
                                s.netPnl >= 0 ? "cell-profit" : "cell-loss"
                              }
                            >
                              {formatCurrency(s.netPnl)}
                            </td>
                            <td
                              className={
                                s.avgPnl >= 0 ? "cell-profit" : "cell-loss"
                              }
                            >
                              {formatCurrency(s.avgPnl)}
                            </td>
                            <td className="cell-profit">
                              {formatCurrency(s.totalProfit)}
                            </td>
                            <td className="cell-loss">
                              {formatCurrency(s.totalLoss)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
