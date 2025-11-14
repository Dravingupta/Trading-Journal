// server/models/strategy.js
const mongoose = require("mongoose");

const strategySchema = new mongoose.Schema(
  {
    owner: {
      type: String,          // Firebase UID
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// One user can't have duplicate strategy names
strategySchema.index({ owner: 1, name: 1 }, { unique: true });

const Strategy = mongoose.model("Strategy", strategySchema);

module.exports = Strategy;
