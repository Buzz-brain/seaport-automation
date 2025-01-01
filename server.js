const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const cargoRoutes = require('./routes/cargo');
const authRoutes = require('./routes/authRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Set up MongoDB connection
mongoose.connect(process.env.MONGO_URI).then(() => console.log('Database connected'))
  .catch((err) => console.error('Database connection error:', err));

// Routes -tested
app.get('/', (req, res) => {
  res.render('index');
});
app.get('/dashboard', (req, res) => {
  res.render('dashboard');
});
app.get('/tracking', (req, res) => {
  res.render('tracking');
});
app.get('/allocation', (req, res) => {
  res.render('allocation');
});

// Middleware to pass io to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use('/api/cargo', cargoRoutes);
app.use('/api/auth', authRoutes);

// const Warehouse = require('./models/warehouse');
// const Cargo = require('./models/cargo');

// const warehouses = [
//   { name: 'Warehouse A', availableUnits: 500, conditions: ['Dry'], totalUnits: 500 },
//   { name: 'Warehouse B', availableUnits: 1000, conditions: ['Cold'], totalUnits: 1000 },
//   { name: 'Warehouse C', availableUnits: 200, conditions: ['Dry'], totalUnits: 200 },
// ];

// const cargos = [
//   { cargoId: 'CARGO001', content: 'Books', size: 50, storageCondition: ['Dry'], currentLocation: 'Port A' },
//   { cargoId: 'CARGO002', content: 'Fruits', size: 200, storageCondition: ['Cold'], currentLocation: 'Port B' },
//   { cargoId: 'CARGO003', content: 'Electronics', size: 100, storageCondition: ['Dry'], currentLocation: 'Port C' },
// ];

// Cargo.insertMany(cargos)
//   .then(() => console.log('Cargos added'))
//   .catch((err) => console.log('Error adding cargos:', err));

// Warehouse.insertMany(warehouses)
//   .then(() => console.log('Warehouses added'))
//   .catch((err) => console.log('Error adding warehouses:', err));


// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
