const express = require('express');
const Admin = require('../models/admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();

// Example: Protected route
router.get('/protected', (req, res) => {
  res.json({ message: 'This is a protected route' });
});


// Admin registration (one-time setup) -tested
router.post('/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const newAdmin = new Admin({ username, password, role });
    await newAdmin.save();
    res.json({ message: 'Admin registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error registering admin' });
  }
});



// Admin login - tested
router.post('/login', async (req, res) => {
  try {
    if (!username || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const { username, password, role } = req.body;
    const admin = await Admin.findOne({ username, role });
    if (!admin) return res.status(404).json({ error: 'Admin not found or incorrect role' });
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Error logging in' });
  }
});



module.exports = router;
