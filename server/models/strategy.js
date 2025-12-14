
const mongoose = require("mongoose");

const strategySchema = new mongoose.Schema(
  {
    owner: {
      type: String,         
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


strategySchema.index({ owner: 1, name: 1 }, { unique: true });

const Strategy = mongoose.model("Strategy", strategySchema);

module.exports = Strategy;
