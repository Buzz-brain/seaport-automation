const mongoose = require('mongoose');

const CargoSchema = new mongoose.Schema({
  cargoId: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  size: { type: Number, required: true },
  storageCondition: [{ type: String, required: true }], // Changed to an array
  currentLocation: { type: String, required: true },
  movementHistory: [
    {
      location: String,
      timestamp: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true });


module.exports = mongoose.model('Cargo', CargoSchema);

