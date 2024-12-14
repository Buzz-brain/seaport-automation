const mongoose = require('mongoose');

const ContainerSchema = new mongoose.Schema({
    containerId: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    storageCondition: { type: String, required: true },
    size: { type: String, required: true },
    storageLocation: { type: String, required: true }, // Replace `currentLocation` with `storageLocation`
    movementHistory: [
        {
            location: String,
            timestamp: { type: Date, default: Date.now },
        },
    ],
});

module.exports = mongoose.model('Container', ContainerSchema);
