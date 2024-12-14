const express = require('express');
const Container = require('../models/container');

module.exports = (io) => {
    const router = express.Router();

    // Dashboard Route

    router.get('/', async (req, res) => {
        const searchQuery = req.query.search || '';
        const containers = await Container.find({
            containerId: { $regex: searchQuery, $options: 'i' }
        });
        res.render('dashboard', { containers, selectedLocation: null });
    });
    

    // Update Location Form Route
    router.get('/update-location', (req, res) => {
        res.render('update-form');
    });

    // Handle Form Submission
    router.post('/update-location', async (req, res) => {
        const { containerId, content, storageCondition, size, storageLocation } = req.body;

        // Find the container by ID
        const container = await Container.findOne({ containerId });
        if (container) {
            // Update existing container
            container.content = content;
            container.storageCondition = storageCondition;
            container.size = size;
            container.storageLocation = storageLocation;
            container.movementHistory.push({ location: storageLocation });
            await container.save();
        } else {
            // Create new container
            await Container.create({
                containerId,
                content,
                storageCondition,
                size,
                storageLocation,
                movementHistory: [{ location: storageLocation }],
            });
        }

        // Emit real-time update
        io.emit('updateDashboard');
        res.redirect('/update-location');
    });

    // Filter by Storage Location
    router.get('/storage/:location', async (req, res) => {
        const { location } = req.params;
        const containers = await Container.find({ storageLocation: `Storage ${location}` });
        res.render('dashboard', { containers, selectedLocation: location });
    });

    router.get('/dashboard/container/:id', async (req, res) => {
        const container = await Container.findOne({ containerId: req.params.id });
        res.render('container-details', { container });
    });
    
    return router;
};
