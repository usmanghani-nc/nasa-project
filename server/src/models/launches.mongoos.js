const mongoose = require('mongoose');

const launchesSchema = mongoose.Schema({
  flightNumber: {
    type: Number,
    required: true,
  },
  customers: [String],
  upcoming: {
    type: Boolean,
    required: true,
  },
  success: {
    type: Boolean,
    required: true,
    default: true,
  },
  mission: {
    type: String,
    required: true,
  },
  target: {
    type: String,
  },
  rocket: {
    type: String,
    required: true,
  },
  launchDate: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model('Launch', launchesSchema);
