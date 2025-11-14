// server/index.js
require('dotenv').config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const Trade = require("./models/trade.js");
const Strategy = require("./models/strategy.js"); // ✅ NEW

const { initializeFirebase, verifyToken } = require("./middleware/firebaseAuth.js");
const admin = require("firebase-admin"); // ✅ use Firebase Admin here as well

// Initialize Firebase Admin SDK
initializeFirebase();

// --- Middleware Setup ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Allow React app (Vite/CRA) to talk to Express API
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

// --- MongoDB Connection ---
const mongourl = process.env.MONGO_URL;

async function main() {
  await mongoose.connect(mongourl);
}

main()
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ DB Error:", err));

// --- Helper Function (PNL Logic) ---
const calculateTradeMetrics = (tradeData, isNew = false) => {
  const { price, stoploss, target, exit, quantity, side } = tradeData;

  const entryPrice = parseFloat(price);
  const stopLoss = parseFloat(stoploss);
  const targetPrice = parseFloat(target);
  const exitPrice = parseFloat(exit);
  const qty = parseInt(quantity);
  const capitalUsed = (entryPrice * qty) / 5;

  let risk, reward, pnl;

  if (side === "SELL") {
    risk = Math.abs((stopLoss - entryPrice) * qty);
    reward = Math.abs((entryPrice - targetPrice) * qty);
    pnl = (entryPrice - exitPrice) * qty;
  } else {
    // BUY
    risk = Math.abs((entryPrice - stopLoss) * qty);
    reward = Math.abs((targetPrice - entryPrice) * qty);
    pnl = (exitPrice - entryPrice) * qty;
  }

  const riskPercent = (risk / capitalUsed) * 100;
  const rewardPercent = (reward / capitalUsed) * 100;
  const pnlPercent = (pnl / capitalUsed) * 100;

  return {
    ...tradeData,
    capitalused: capitalUsed,
    risk,
    reward,
    pnl,
    risk_percent: riskPercent,
    reward_percent: rewardPercent,
    pnl_percent: pnlPercent,
    rating: parseInt(tradeData.rating),
    ...(isNew && !tradeData.date ? { date: Date.now() } : {}),
  };
};

// --- Auth Utility Route (NOT protected) ---
// Check if a Firebase user exists for given email
app.post("/api/auth/check-email", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  try {
    await admin.auth().getUserByEmail(email);
    // If no error, user exists
    return res.json({ exists: true });
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      return res.json({ exists: false });
    }
    console.error("Error checking user by email:", error);
    return res
      .status(500)
      .json({ message: "Error checking user", error: error.message });
  }
});

// --- API Routes (Protected with verifyToken) ---

// Get all trades for logged-in user
app.get("/api/trades", verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;

    const allTrades = await Trade.find({ owner: userId }).sort({ date: -1 });

    res.status(200).json(allTrades);
  } catch (err) {
    console.error("Error fetching trades:", err);
    res
      .status(500)
      .json({ message: "Error fetching trades", error: err.message });
  }
});


// ================== Strategy Routes (per-user master list) ==================

// Get all strategies for logged-in user
app.get("/api/strategies", verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const strategies = await Strategy.find({ owner: userId }).sort({ createdAt: 1 });
    res.status(200).json(strategies);
  } catch (err) {
    console.error("Error fetching strategies:", err);
    res.status(500).json({ message: "Error fetching strategies", error: err.message });
  }
});

// Add a strategy (idempotent: returns existing if already present)
app.post("/api/strategies", verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    let { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Strategy name is required." });
    }

    name = name.trim();

    // Check if already exists for this user
    let existing = await Strategy.findOne({ owner: userId, name });
    if (existing) {
      return res.status(200).json(existing);
    }

    const strategy = new Strategy({ owner: userId, name });
    await strategy.save();
    res.status(201).json(strategy);
  } catch (err) {
    console.error("Error creating strategy:", err);
    res.status(500).json({ message: "Error creating strategy", error: err.message });
  }
});

// Delete strategy (does NOT modify old trades, they keep their text)
app.delete("/api/strategies/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { id } = req.params;

    const deleted = await Strategy.findOneAndDelete({ _id: id, owner: userId });

    if (!deleted) {
      return res.status(404).json({ message: "Strategy not found or unauthorized." });
    }

    res.status(200).json({ message: "Strategy deleted successfully" });
  } catch (err) {
    console.error("Error deleting strategy:", err);
    res.status(500).json({ message: "Error deleting strategy", error: err.message });
  }
});


// Add new trade
app.post("/api/trades", verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;

    const tradeDataWithMetrics = calculateTradeMetrics(req.body, true);

    const newTrade = new Trade({
      ...tradeDataWithMetrics,
      owner: userId,
    });

    await newTrade.save();
    res.status(201).json(newTrade);
  } catch (e) {
    console.error("Error saving trade:", e);
    res
      .status(400)
      .json({ message: "Error saving trade", error: e.message });
  }
});

// Get single trade
app.get("/api/trades/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    const trade = await Trade.findOne({ _id: id, owner: userId });

    if (!trade) {
      return res.status(404).json({ message: "Trade not found." });
    }

    res.status(200).json(trade);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching trade", error: err.message });
  }
});

// Update trade
app.put("/api/trades/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    const updatedDataWithMetrics = calculateTradeMetrics(req.body);

    const updatedTrade = await Trade.findOneAndUpdate(
      { _id: id, owner: userId },
      updatedDataWithMetrics,
      { new: true, runValidators: true }
    );

    if (!updatedTrade) {
      return res
        .status(404)
        .json({ message: "Trade not found or unauthorized." });
    }

    res.status(200).json(updatedTrade);
  } catch (e) {
    console.error("Error updating trade:", e);
    res
      .status(400)
      .json({ message: "Error updating trade", error: e.message });
  }
});

// Delete trade
app.delete("/api/trades/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    const deletedTrade = await Trade.findOneAndDelete({ _id: id, owner: userId });

    if (!deletedTrade) {
      return res
        .status(404)
        .json({ message: "Trade not found or unauthorized." });
    }

    res.status(200).json({ message: "Trade deleted successfully" });
  } catch (e) {
    res
      .status(500)
      .json({ message: "Error deleting trade", error: e.message });
  }
});




// --- Analytics Route (per user) ---
// --- Analytics Route (per user, with filters) ---
app.get("/api/analytics", verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { range, from, to, strategy, side } = req.query;

    const query = { owner: userId };

    // ---- Date filter logic ----
    let startDate = null;
    let endDate = null;

    if (from || to) {
      if (from) {
        startDate = new Date(from);
        startDate.setHours(0, 0, 0, 0);
      }
      if (to) {
        endDate = new Date(to);
        endDate.setHours(23, 59, 59, 999);
      }
    } else if (range && range !== "all") {
      const days = parseInt(range, 10);
      if (!isNaN(days)) {
        endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
        startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);
      }
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }

    // ---- Strategy filter ----
    if (strategy && strategy !== "all") {
      query.stratagy = strategy;
    }

    // ---- Side filter ----
    if (side && side !== "all") {
      query.side = side;
    }

    // Fetch all trades for this user with given filters, oldest first
    const trades = await Trade.find(query).sort({ date: 1 });

    if (trades.length === 0) {
      return res.json({ hasData: false });
    }

    let totalTrades = trades.length;
    let winningTrades = 0;
    let losingTrades = 0;
    let totalProfit = 0;
    let totalLoss = 0;
    let totalRisk = 0;
    let totalReward = 0;
    let totalRMultiple = 0;
    let totalPnl = 0;

    let bestTrade = null;
    let worstTrade = null;

    // Strategy map
    const strategyStats = {}; // key = stratagy string

    // Equity curve (cumulative pnl)
    const equityCurve = [];
    let cumulativePnl = 0;

    for (const t of trades) {
      const pnl = t.pnl || 0;
      const risk = t.risk || 0;
      const reward = t.reward || 0;

      totalPnl += pnl;
      if (pnl > 0) {
        winningTrades++;
        totalProfit += pnl;
      } else if (pnl < 0) {
        losingTrades++;
        totalLoss += pnl; // negative
      }

      totalRisk += risk;
      totalReward += reward;

      if (risk !== 0) {
        totalRMultiple += reward / risk;
      }

      // Best / worst trade
      if (!bestTrade || pnl > bestTrade.pnl) {
        bestTrade = {
          _id: t._id,
          symbol: t.symbol,
          pnl: pnl,
          stratagy: t.stratagy,
          side: t.side,
          date: t.date,
        };
      }
      if (!worstTrade || pnl < worstTrade.pnl) {
        worstTrade = {
          _id: t._id,
          symbol: t.symbol,
          pnl: pnl,
          stratagy: t.stratagy,
          side: t.side,
          date: t.date,
        };
      }

      // Strategy stats
      const key = t.stratagy || "Unknown";
      if (!strategyStats[key]) {
        strategyStats[key] = {
          stratagy: key,
          trades: 0,
          wins: 0,
          losses: 0,
          netPnl: 0,
          totalProfit: 0,
          totalLoss: 0,
        };
      }

      const s = strategyStats[key];
      s.trades += 1;
      s.netPnl += pnl;
      if (pnl > 0) {
        s.wins += 1;
        s.totalProfit += pnl;
      } else if (pnl < 0) {
        s.losses += 1;
        s.totalLoss += pnl;
      }

      // Equity curve point
      cumulativePnl += pnl;
      equityCurve.push({
        date: t.date,
        cumulativePnl,
      });
    }

    const winRate =
      totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
    const avgRisk = totalTrades > 0 ? totalRisk / totalTrades : 0;
    const avgReward = totalTrades > 0 ? totalReward / totalTrades : 0;
    const avgRMultiple =
      totalTrades > 0 ? totalRMultiple / totalTrades : 0;
    const avgPnl = totalTrades > 0 ? totalPnl / totalTrades : 0;

    const byStrategy = Object.values(strategyStats).map((s) => ({
      ...s,
      winRate: s.trades > 0 ? (s.wins / s.trades) * 100 : 0,
      avgPnl: s.trades > 0 ? s.netPnl / s.trades : 0,
    }));

    res.json({
      hasData: true,
      summary: {
        totalTrades,
        winningTrades,
        losingTrades,
        winRate,
        netPnl: totalPnl,
        totalProfit,
        totalLoss,
        avgRisk,
        avgReward,
        avgRMultiple,
        avgPnl,
        bestTrade,
        worstTrade,
      },
      byStrategy,
      equityCurve,
    });
  } catch (err) {
    console.error("Error computing analytics:", err);
    res
      .status(500)
      .json({ message: "Error computing analytics", error: err.message });
  }
});



// --- Server Startup ---
const PORT = 1200;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
