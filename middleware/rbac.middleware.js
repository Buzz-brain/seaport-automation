// RBAC Middleware
const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');

const rbac = (roles) => async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    if (!roles.includes(admin.role) && admin.role !== 'superAdmin') return res.status(403).json({ message: 'Forbidden' });
    req.admin = admin;
    next();
  } catch (err) {
    res.status(500).json({ message: 'Error authenticating admin' });
  }
};

module.exports = rbac;