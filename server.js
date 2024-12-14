const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const http = require('http');
const { Server } = require('socket.io');
const Container = require('./models/container');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');

// MongoDB Connection
mongoose.connect('mongodb+srv://chinomsochristian03:ahYZxLh5loYrfgss@cluster0.dmkcl.mongodb.net/buzzsecure?retryWrites=true&w=majority').then(() => console.log('Database Connected'))
  .catch((err) => console.error('Database Connection Error:', err));

// Routes
app.use('/', require('./routes/index')(io));

// Start Server
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
