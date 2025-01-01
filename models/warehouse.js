const mongoose = require('mongoose');

const WarehouseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  totalUnits: { type: Number, required: true },
  availableUnits: { type: Number, required: true },
  conditions: [String], // e.g., ['temperature-controlled', 'dry', 'secure']
  allocatedCargos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Cargo' }],
});

module.exports = mongoose.model('Warehouse', WarehouseSchema);
