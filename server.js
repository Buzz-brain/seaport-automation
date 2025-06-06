const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
MONGO_URI=mongodb+srv://chinomsochristian03:ahYZxLh5loYrfgss@cluster0.dmkcl.mongodb.net/seaauto?retryWrites=true&w=majority
const cargoRoutes = require('./routes/cargo');
const authRoutes = require('./routes/authRoutes');
const rbac = require('./middleware/rbac.middleware');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 5100;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

// Set up MongoDB connection
async function connectToMongoDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Database connected');
  } catch (err) {
    console.error('Database connection error:', err);
  }
}
connectToMongoDB();

// Routes with Role-Based Access Control
app.get('/', (req, res) => res.render('index'));
// app.get('/tracking', rbac(['portAuthority', 'superAdmin']), (req, res) => res.render('tracking'));
// app.get('/surveillance', rbac(['securityOfficer', 'superAdmin']), (req, res) => res.render('surveillance'));
// app.get('/surveillance', rbac(['securityOfficer', 'superAdmin']), (req, res) => res.render('surveillance'));
// app.get('/liveSurveillance', rbac(['securityOfficer', 'superAdmin']), (req, res) => res.render('liveSurveillance'));
// app.get('/allocation', rbac(['terminalOperator', 'superAdmin']), (req, res) => res.render('allocation'));
// app.get('/dashboard', rbac(['superAdmin']), (req, res) => res.render('dashboard'));

app.get('/tracking', (req, res) => res.render('tracking'));
app.get('/surveillance', (req, res) => res.render('surveillance'));
app.get('/surveillance', (req, res) => res.render('surveillance'));
app.get('/liveSurveillance', (req, res) => res.render('liveSurveillance'));
app.get('/allocation', (req, res) => res.render('allocation'));
app.get('/dashboard', (req, res) => res.render('dashboard'));

// Middleware to pass io to routes
app.use((req, res, next) => { req.io = io; next(); });
app.use('/api/cargo', cargoRoutes);
app.use('/api/auth', authRoutes);

// Multer Configuration for File Uploads
const upload = multer({ dest: 'uploads/' });
app.post('/detect', upload.single('video'), async (req, res) => {
  try {
    // Just return a success message, the actual object detection will be handled in the browser
    res.json({ message: 'Video uploaded successfully' });
  } catch (err) {
    console.error('Error during video upload:', err);
    res.status(500).json({ error: 'Error uploading video' });
  }
});

// WebSocket Events
io.on('connection', (socket) => {
  console.log('Admin connected to WebSocket');
  socket.on('disconnect', () => console.log('Admin disconnected'));
  socket.on('error', (err) => console.error('WebSocket error:', err));
});

server.listen(3100, () => console.log('Server running on port 3000'));

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
