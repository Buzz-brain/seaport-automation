const express = require('express');
const router = express.Router();
const Cargo = require('../models/cargo');
const Warehouse = require('../models/warehouse');

// CARGO TRACKNG SECTION

// Update location route -tested
router.put('/location', async (req, res) => {
    try {
        const { cargoId } = req.body;
        const { newLocation } = req.body;

        const cargo = await Cargo.findOne({ cargoId: cargoId });
        if (!cargo) return res.status(404).json({ error: 'Cargo not found' });

        cargo.currentLocation = newLocation;
        cargo.movementHistory.push({ location: newLocation });
        await cargo.save();

        // Emit event
        req.io.emit('locationUpdated', cargo);
        res.json({ message: 'Cargo location updated', cargo });
    } catch (err) {
        res.status(500).json({ error: 'Error updating cargo location', details: err.message });
    }
});

// Get all cargos -tested
router.get('/', async (req, res) => {
    try {
        const cargos = await Cargo.find();
        res.json(cargos);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching cargos', details: err.message });
    }
});

// Search cargo by id or content -tested
router.get('/search', async (req, res) => {
    try {
        const { cargoId, content } = req.query;

        // Build the search query dynamically
        const searchCriteria = [];
        if (cargoId) searchCriteria.push({ cargoId: { $regex: cargoId, $options: 'i' } });
        if (content) searchCriteria.push({ content: { $regex: content, $options: 'i' } });

        const cargos = searchCriteria.length > 0
            ? await Cargo.find({ $or: searchCriteria })
            : [];

        res.json(cargos);
        console.log(cargos);
    } catch (err) {
        res.status(500).json({ error: 'Error searching cargos', details: err.message });
    }
});


//STORAGE ALLOCATION SECTION

// Add cargo route -tested
router.post('/add', async (req, res) => {
    try {
        const { cargoId, content, size, storageCondition, currentLocation } = req.body;
        const newCargo = new Cargo({
            cargoId,
            content,
            size,
            storageCondition,
            currentLocation,
            movementHistory: [{ location: currentLocation }],
        });
        await newCargo.save();

        // Emit event
        req.io.emit('cargoAdded', newCargo);
        res.status(201).json({ message: 'Cargo added successfully', cargo: newCargo });
    } catch (err) {
        res.status(500).json({ error: 'Error adding cargo', details: err.message });
    }
});


router.post('/:cargoId/allocate', async (req, res) => {
  try {
    const { cargoId } = req.params;

    // Find the cargo
    const cargo = await Cargo.findOne({ cargoId });
    if (!cargo) return res.status(404).json({ error: 'Cargo not found' });

    // Find a suitable warehouse
    const warehouse = await Warehouse.findOne({
      availableUnits: { $gte: cargo.size },
      conditions: { $all: cargo.storageCondition },
    });
    if (!warehouse) return res.status(400).json({ error: 'No suitable storage available' });

    // Check if the cargo is already allocated in this warehouse
    if (warehouse.allocatedCargos.includes(cargo._id)) {
      return res.status(400).json({ error: 'This Cargo is already allocated in this warehouse' });
    }

    // Allocate storage
    warehouse.availableUnits -= cargo.size;
    warehouse.allocatedCargos.push(cargo._id);
    await warehouse.save();

    // Return the warehouse details in the response
    res.json({
      message: `Cargo ${cargoId} allocated to ${warehouse.name}`,
      warehouse: {
        name: warehouse.name,
        id: warehouse._id,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Error allocating storage', details: err.message });
  }
});



// Fetch warehouse info - tested
router.get('/warehouses', async (req, res) => {
    try {
        const warehouses = await Warehouse.find().populate('allocatedCargos', 'cargoId content size storageCondition');
        res.json(warehouses);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching warehouses', details: err.message });
    }
});



module.exports = router;