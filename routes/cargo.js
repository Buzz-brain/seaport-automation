const express = require('express');
const router = express.Router();
const Cargo = require('../models/cargo');
const Warehouse = require('../models/warehouse');
const nodemailer = require('nodemailer');

// CARGO TRACKNG SECTION

// Update location route -tested
// router.put('/location', async (req, res) => {
//     try {
//         const { cargoId } = req.body;
//         const { newLocation } = req.body;

//         const cargo = await Cargo.findOne({ cargoId: cargoId });
//         if (!cargo) return res.status(404).json({ error: 'Cargo not found' });

//         if (newLocation === 'Exit' && cargo.customsStatus !== 'cleared') {
//           return res.status(400).json({ error: 'Cargo cannot exit without being cleared' });
//         }    

//         cargo.currentLocation = newLocation;
//         cargo.movementHistory.push({ location: newLocation });
//         await cargo.save();

//         // Emit event
//         req.io.emit('locationUpdated', cargo);
//         res.json({ message: 'Cargo location updated', cargo });
//     } catch (err) {
//         res.status(500).json({ error: 'Error updating cargo location', details: err.message });
//     }
// });

const validPath = [
  'Arrived',
  'Point A',
  'Point B',
  'Point C',
  'Point D',
  'Warehouse A', 'Warehouse B', 'Warehouse C',
  'Exit'
];


// Update location route
router.put('/location', async (req, res) => {
  try {
    const { cargoId, newLocation } = req.body;

    const cargo = await Cargo.findOne({ cargoId }).populate('warehouse');
    if (!cargo) return res.status(404).json({ error: 'Cargo not found' });

    const currentLoc = cargo.currentLocation;

    // ✅ Validate location names
    if (!validPath.includes(currentLoc) || !validPath.includes(newLocation)) {
      return res.status(400).json({ error: 'Invalid location specified' });
    }

    // ✅ Prevent same-location updates
    if (currentLoc === newLocation) {
      return res.status(400).json({ error: 'Cargo is already at this location' });
    }

    // ✅ Enforce warehouse consistency
    const warehouseNames = ['Warehouse A', 'Warehouse B', 'Warehouse C'];
    if (warehouseNames.includes(newLocation)) {
      if (!cargo.warehouse) {
        return res.status(400).json({ error: 'Cargo has not been allocated to a warehouse yet' });
      }
      if (cargo.warehouse.name !== newLocation) {
        return res.status(400).json({ error: `Cargo is only allowed into ${cargo.warehouse.name}` });
      }
    }

    // ✅ Enforce customs clearance before Exit
    if (newLocation === 'Exit' && cargo.customsStatus !== 'cleared') {
      return res.status(400).json({ error: 'Cargo cannot exit without being cleared' });
    }

    // ✅ Enforce movement sequence
    const currentIndex = validPath.indexOf(currentLoc);
    const newIndex = validPath.indexOf(newLocation);
    console.log(currentIndex, newIndex)
    if (newIndex > currentIndex + 1) {
      return res.status(400).json({ error: 'Cannot skip steps forward' });
    }
    if (newIndex < currentIndex - 1) {
      return res.status(400).json({ error: 'Cannot skip steps backward' });
    }

    // ✅ Prevent updates after Exit
    if (currentLoc === 'Exit') {
      return res.status(400).json({ error: 'Cargo has already exited' });
    }

    // ✅ Update location
    cargo.currentLocation = newLocation;
    cargo.movementHistory.push({ location: newLocation });
    await cargo.save();

    req.io.emit('locationUpdated', cargo);
    res.json({ message: 'Cargo location updated', cargo });

  } catch (err) {
    res.status(500).json({ error: 'Error updating cargo location', details: err.message });
  }
});


// Get all cargos with warehouse info populated
router.get('/', async (req, res) => {
    try {
        const cargos = await Cargo.find()
            .populate('warehouse', 'name') // only fetch warehouse name
            .exec();
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

// Fetch warehouse info - tested
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

    // ✅ Update the cargo to reference this warehouse
    cargo.warehouse = warehouse._id;
    await cargo.save();

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

router.get('/warehouses', async (req, res) => {
    try {
        const warehouses = await Warehouse.find().populate('allocatedCargos', 'cargoId content size storageCondition customsStatus');
        res.json(warehouses);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching warehouses', details: err.message });
    }
});

router.put('/customs-status', async (req, res) => {
  try {
    const { cargoId, customsStatus } = req.body;
    const cargo = await Cargo.findOneAndUpdate({ cargoId }, { customsStatus }, { new: true });
    if (!cargo) {
      return res.status(404).json({ error: 'Cargo not found' });
    }
    res.json({ message: 'Customs status updated successfully' });
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: 'Error updating customs status' });
  }
});

// DELETE all cargos and clear allocatedCargos in all warehouses
router.delete('/reset-warehouses', async (req, res) => {
    try {
        // Delete all cargos
        await Cargo.deleteMany({});

        // Clear allocatedCargos in all warehouses
        await Warehouse.deleteMany({});

        res.json({ message: 'All cargos deleted and all warehouse cargo lists cleared' });
    } catch (err) {
        res.status(500).json({ error: 'Error resetting warehouses and deleting cargos', details: err.message });
    }
});

router.post('/send-alert', async (req, res) => {
  const { message } = req.body;
  console.log("oya oo", message)

  if (!message) return res.status(400).json({ error: 'Message is required' });

  const transporter = nodemailer.createTransport({
    service: 'Gmail', // or use SMTP
    auth: {
      user: 'chinomsochristian03@gmail.com',
      pass: 'lvju arpk rscp uiai' // use app password if 2FA is on
    }
  });

  const mailOptions = {
    from: 'chinomsochristian03@gmail.com',
    to: 'chinomsochristian03@gmail.com',
    subject: 'Object Detection Alert',
    text: message
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, msg: 'Email sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: 'Email failed to send' });
  }
});

module.exports = router;

// {
//     "email": "adaobionwuachu41@gmail.com",
//     "username": "Adaobi41",
//     "password": "1234",
//     "role": "driver"
// }