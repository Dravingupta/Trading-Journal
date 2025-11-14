// client/src/pages/EditTrade.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';                   // ✅ use api
import Sidebar from '../components/Sidebar.jsx';
import '../App.css';

const EditTrade = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [strategies, setStrategies] = useState([]);

  // Load strategies & trade
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [strategyRes, tradeRes] = await Promise.all([
          api.get('/strategies'),
          api.get(`/trades/${id}`),
        ]);

        setStrategies(strategyRes.data || []);

        const tradeData = tradeRes.data;
        const formattedDate = new Date(tradeData.date)
          .toISOString()
          .split('T')[0];

        setFormData({
          ...tradeData,
          date: formattedDate,
          quantity: String(tradeData.quantity),
          price: String(tradeData.price),
          target: String(tradeData.target),
          stoploss: String(tradeData.stoploss),
          exit: String(tradeData.exit),
          rating: String(tradeData.rating),
        });

        // ensure this trade's strategy is in list
        if (
          tradeData.stratagy &&
          !strategyRes.data.some(
            (s) => s.name.toLowerCase() === tradeData.stratagy.toLowerCase()
          )
        ) {
          const res = await api.post('/strategies', { name: tradeData.stratagy });
          setStrategies((prev) => [...prev, res.data]);
        }

        setLoading(false);
      } catch (err) {
        console.error('Fetch Trade Error:', err);
        setError('Failed to load trade for editing. Access denied or trade deleted.');
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    setSaving(true);
    setError(null);

    const tradeDataToSend = {
      ...formData,
      quantity: parseInt(formData.quantity, 10),
      price: parseFloat(formData.price),
      target: parseFloat(formData.target),
      stoploss: parseFloat(formData.stoploss),
      exit: parseFloat(formData.exit),
      rating: parseInt(formData.rating, 10),
    };

    try {
      await api.put(`/trades/${id}`, tradeDataToSend);

      const strategyName =
        tradeDataToSend.stratagy && tradeDataToSend.stratagy.trim();
      if (
        strategyName &&
        !strategies.some(
          (s) => s.name.toLowerCase() === strategyName.toLowerCase()
        )
      ) {
        const res = await api.post('/strategies', { name: strategyName });
        setStrategies((prev) => [...prev, res.data]);
      }

      alert('✅ Trade updated successfully!');
      navigate(`/${id}`);
    } catch (err) {
      console.error('Error updating trade:', err.response?.data || err.message);
      setError(
        `❌ Error updating trade: ${
          err.response?.data?.message || err.message
        }`
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading || !formData)
    return <div>Loading trade data for editing... ⏳</div>;
  if (error)
    return (
      <div style={{ color: 'red', padding: '20px' }}>Error: {error}</div>
    );

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content" id="main">
        <header className="header analytics-header">
          <h1>✏️ Edit Trade: {formData.symbol.toUpperCase()}</h1>
          <p className="header-subtext">Update trade details and re-calculate PNL</p>
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
                    value={formData.symbol}
                    onChange={handleChange}
                  />

                  {/* Strategy free-text with suggestions */}
                  <label htmlFor="stratagy">Strategy:</label>
                  <input
                    list="strategy-options"
                    id="stratagy"
                    name="stratagy"
                    required
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
                    value={formData.quantity}
                    onChange={handleChange}
                  />

                  <label htmlFor="price">Entry Price (₹):</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    step="0.01"
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

              <div className="form-section">
                <label htmlFor="description">Entry Reason:</label>
                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                ></textarea>
              </div>

              <div className="form-section">
                <div className="input-row">
                  <label htmlFor="exit">Exit Price (₹):</label>
                  <input
                    type="number"
                    id="exit"
                    name="exit"
                    step="0.01"
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

              <div className="form-section">
                <div className="input-row">
                  <label htmlFor="target">Target (₹):</label>
                  <input
                    type="number"
                    id="target"
                    name="target"
                    step="0.01"
                    value={formData.target}
                    onChange={handleChange}
                  />

                  <label htmlFor="stoploss">Stoploss (₹):</label>
                  <input
                    type="number"
                    id="stoploss"
                    name="stoploss"
                    step="0.01"
                    value={formData.stoploss}
                    onChange={handleChange}
                  />
                </div>
              </div>

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

              {/* Strategy chips */}
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

              {error && (
                <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>
              )}
              <button type="submit" className="submit-btn" disabled={saving}>
                {saving ? 'Updating...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTrade;
