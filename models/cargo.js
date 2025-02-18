const mongoose = require('mongoose');

const CargoSchema = new mongoose.Schema({
  cargoId: { type: String, required: true, unique: true, id: true, },
  content: { type: String, required: true },
  size: { type: Number, required: true },
  storageCondition: [{ type: String, required: true }],
  currentLocation: { type: String, required: true },
  movementHistory: [
    {
      location: String,
      timestamp: { type: Date, default: Date.now },
    },
  ],
  arrivalTime: { type: Date, default: Date.now },
  departureTime: { type: Date },
  customsStatus: { type: String, enum: ['cleared', 'pending', 'rejected'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Cargo', CargoSchema);

