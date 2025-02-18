const express = require('express');
const Admin = require('../models/admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();

// Admin registration (one-time setup) -tested
router.post('/register', async (req, res) => {
  try {
    const { email, username, password, role } = req.body;
    if (!email || !username || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const newAdmin = new Admin({ email, username, password, role });
    await newAdmin.save();
    res.json({ message: 'Admin registered successfully' });
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: 'Error registering admin' });
  }
});

<<<<<<< HEAD
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    console.log(req.body)

    if (!email || !password || !role) {
      return res.status(400).json({ message: "Email, password, and role are required" });
    }

    const admin = await Admin.findOne({ email, role });
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

=======
// Admin login - tested
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const admin = await Admin.findOne({ email, role });
    if (!admin) return res.status(404).json({ message: 'Admin not found or incorrect role' });
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
>>>>>>> 0ff16e3b70c68a7d5af2a4c09726bda34a1a35b1
    const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Error logging in' });
  }
});

<<<<<<< HEAD

=======
>>>>>>> 0ff16e3b70c68a7d5af2a4c09726bda34a1a35b1
module.exports = router;
