const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const tradeSchema = new Schema({
    owner: {
        type: String, 
        required: true
    },
    symbol: {
        type: String,
        required: true
    },
    side: String,
    description: String,
    quantity: Number,
    price: Number,
    target: Number,
    stoploss: Number,
    exit: Number,
    stratagy: String,
    exitreason: String,

    date: {
        type: Date,
        default: Date.now
    },
    capitalused: Number,
    risk: Number,
    reward: Number,
    pnl: Number,
    risk_percent: Number,
    reward_percent: Number,
    pnl_percent: Number,
    rating: {
        type: Number,
        min: 0,
        max: 10,
        required: true
    },
}, { timestamps: true }); // timestam

let Trade = mongoose.model("Trade", tradeSchema); // Model name change to PascalCase convention

module.exports = Trade;
