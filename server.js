sconst express = require('express');
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
server.set("views", path.join(__dirname, "views")); // Set views directory

// MongoDB Connection
mongoose.connect('mongodb+srv://chinomsochristian03:ahYZxLh5loYrfgss@cluster0.dmkcl.mongodb.net/buzzsecure?retryWrites=true&w=majority')
  .then(() => console.log('Database Connected'))
  .catch((err) => console.error('Database Connection Error:', err));

// Real-time Dashboard Update
io.on('connection', (socket) => {
  console.log('A user connected');
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Routes
app.get('/', async (req, res) => {
  const searchQuery = req.query.search || '';
  const containers = await Container.find({
    containerId: { $regex: searchQuery, $options: 'i' },
  });
  res.render('index', { containers, selectedLocation: null });
});

app.get('/update-location', (req, res) => {
  res.render('update-form');
});

app.post('/update-location', async (req, res) => {
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

app.get('/storage/:location', async (req, res) => {
  const { location } = req.params;
  const containers = await Container.find({ storageLocation: `Storage ${location}` });
  res.render('index', { containers, selectedLocation: location });
});

app.get('/container/:id', async (req, res) => {
  const container = await Container.findOne({ containerId: req.params.id });
  res.render('container-details', { container });
});

// Start Server
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
