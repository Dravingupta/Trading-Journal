// client/src/pages/NewTrade.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';                 // ✅ use shared axios instance with token
import Sidebar from '../components/Sidebar';
import '../App.css';

const NewTrade = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    symbol: '',
    side: '',
    description: '',
    quantity: 0,
    price: 0,
    target: 0,
    stoploss: 0,
    exit: 0,
    stratagy: '',
    exitreason: '',
    date: new Date().toISOString().split('T')[0],
    rating: 5,
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [strategies, setStrategies] = useState([]);

  // Fetch strategies from backend on mount
  useEffect(() => {
    const fetchStrategies = async () => {
      try {
        const res = await api.get('/strategies');
        setStrategies(res.data || []);
      } catch (err) {
        console.error('Error loading strategies:', err);
        // fail silently on first version, form still works
      }
    };
    fetchStrategies();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'rating' || name === 'quantity'
          ? parseInt(value, 10)
          : value,
    }));
  };

  const handleDeleteStrategy = async (strategyId) => {
    try {
      await api.delete(`/strategies/${strategyId}`);
      setStrategies((prev) => prev.filter((s) => s._id !== strategyId));
    } catch (err) {
      console.error('Error deleting strategy:', err);
      alert('❌ Failed to delete strategy.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const tradeData = {
      ...formData,
      quantity: parseInt(formData.quantity, 10),
      price: parseFloat(formData.price),
      target: parseFloat(formData.target),
      stoploss: parseFloat(formData.stoploss),
      exit: parseFloat(formData.exit),
      rating: parseInt(formData.rating, 10),
    };

    try {
      // ✅ Auth token auto-added
      await api.post('/trades', tradeData);
      setMessage('✅ Trade successfully added!');

      // ✅ Ensure strategy is stored in DB for this user
      const strategyName = tradeData.stratagy && tradeData.stratagy.trim();
      if (
        strategyName &&
        !strategies.some(
          (s) => s.name.toLowerCase() === strategyName.toLowerCase()
        )
      ) {
        const res = await api.post('/strategies', { name: strategyName });
        setStrategies((prev) => [...prev, res.data]);
      }

      navigate('/');
    } catch (error) {
      console.error('Error adding trade:', error.response?.data || error.message);
      setMessage(
        `❌ Error saving trade: ${error.response?.data?.message || error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="layout">
      <Sidebar />

      <div className="main-content" id="main">
        <header className="header analytics-header">
          <h1>➕ Add New Trade</h1>
          <p className="header-subtext">Enter trade details with precision</p>
        </header>

        <div className="container">
          <div className="trade-form-card">
            <form onSubmit={handleSubmit}>
              <div className="form-section">
                <div className="input-row">
                  <label htmlFor="side">Side:</label>
                  <select
                    id="side"
                    name="side"
                    required
                    value={formData.side}
                    onChange={handleChange}
                  >
                    <option value="" disabled>
                      Select Side
                    </option>
                    <option value="BUY">BUY</option>
                    <option value="SELL">SELL</option>
                  </select>

                  <label htmlFor="symbol">Symbol:</label>
                  <input
                    type="text"
                    id="symbol"
                    name="symbol"
                    required
                    placeholder="e.g., RELIANCE"
                    value={formData.symbol}
                    onChange={handleChange}
                  />

                  {/* 🔹 Strategy: free text + suggestions from DB */}
                  <label htmlFor="stratagy">Strategy:</label>
                  <input
                    list="strategy-options"
                    id="stratagy"
                    name="stratagy"
                    required
                    placeholder="e.g., Breakout, Pullback..."
                    value={formData.stratagy}
                    onChange={handleChange}
                  />
                  <datalist id="strategy-options">
                    {strategies.map((s) => (
                      <option key={s._id} value={s.name} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Quantity, Entry Price, Date */}
              <div className="form-section">
                <div className="input-row">
                  <label htmlFor="quantity">Quantity:</label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    min="1"
                    step="1"
                    required
                    placeholder="e.g., 100"
                    value={formData.quantity}
                    onChange={handleChange}
                  />

                  <label htmlFor="price">Entry Price (₹):</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    step="0.01"
                    placeholder="e.g., 1500.50"
                    value={formData.price}
                    onChange={handleChange}
                  />

                  <label htmlFor="date">Date:</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Entry Reason */}
              <div className="form-section">
                <label htmlFor="description">Entry Reason:</label>
                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  placeholder="e.g., Breakout above resistance"
                  value={formData.description}
                  onChange={handleChange}
                ></textarea>
              </div>

              {/* Exit Price, Exit Reason */}
              <div className="form-section">
                <div className="input-row">
                  <label htmlFor="exit">Exit Price (₹):</label>
                  <input
                    type="number"
                    id="exit"
                    name="exit"
                    step="0.01"
                    placeholder="e.g., 1550.75"
                    value={formData.exit}
                    onChange={handleChange}
                  />

                  <label htmlFor="exitreason">Exit Reason:</label>
                  <select
                    id="exitreason"
                    name="exitreason"
                    required
                    value={formData.exitreason}
                    onChange={handleChange}
                  >
                    <option value="" disabled>
                      -- Select Exit Reason --
                    </option>
                    <option value="Target/Stoploss hit">TG/SL hit</option>
                    <option value="Psychology problem">Psychology problem</option>
                    <option value="Trailing Stoploss hit">Trailing SL hit</option>
                  </select>
                </div>
              </div>

              {/* Target, Stoploss */}
              <div className="form-section">
                <div className="input-row">
                  <label htmlFor="target">Target (₹):</label>
                  <input
                    type="number"
                    id="target"
                    name="target"
                    step="0.01"
                    placeholder="e.g., 1600.00"
                    value={formData.target}
                    onChange={handleChange}
                  />

                  <label htmlFor="stoploss">Stoploss (₹):</label>
                  <input
                    type="number"
                    id="stoploss"
                    name="stoploss"
                    step="0.01"
                    placeholder="e.g., 1450.00"
                    value={formData.stoploss}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Rating */}
              <div className="form-section">
                <label htmlFor="rating">Satisfactory Rating (1-10):</label>
                <div className="slider-container">
                  <input
                    type="range"
                    id="rating"
                    name="rating"
                    min="0"
                    max="10"
                    value={formData.rating}
                    required
                    onChange={handleChange}
                    style={{ paddingRight: 0 }}
                  />
                  <span id="rating-value">{formData.rating}</span>
                </div>
              </div>

              {/* Strategy chips with delete */}
              {strategies.length > 0 && (
                <div className="form-section">
                  <label>Saved strategies:</label>
                  <div className="strategy-chip-row">
                    {strategies.map((s) => (
                      <span key={s._id} className="strategy-chip">
                        {s.name}
                        <button
                          type="button"
                          className="strategy-chip-delete"
                          onClick={() => handleDeleteStrategy(s._id)}
                          title="Remove strategy from list"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Saving...' : 'Add Trade'}
              </button>
              {message && (
                <p
                  style={{
                    marginTop: '10px',
                    color: message.startsWith('❌') ? 'red' : 'green',
                  }}
                >
                  {message}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewTrade;
