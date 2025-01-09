const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const cargoRoutes = require('./routes/cargo');
const authRoutes = require('./routes/authRoutes');

// const tf = require('@tensorflow/tfjs-node');
const tf = require('@tensorflow/tfjs');
const cocoSsd = require('@tensorflow-models/coco-ssd');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 5000;

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
app.get('/surveillance', (req, res) => {
  res.render('surveillance');
});

// Middleware to pass io to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use('/api/cargo', cargoRoutes);
app.use('/api/auth', authRoutes);

// TensorFlow Object Detection
// const detectObjects = async (imageBuffer) => {
//   const model = await cocoSsd.load();
//   const image = tf.node.decodeImage(imageBuffer);
//   const predictions = await model.detect(image);
//   return predictions;
// };

const detectObjects = async (imageBuffer) => {
  // Create a temporary image element
  const image = new Image();
  image.src = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;

  // Wait for the model to load
  const model = await cocoSsd.load();

  // Use the image for prediction
  const predictions = await model.detect(image);
  return predictions;
};

// without node
// const detectObjects = async (imageBuffer) => {
//   const model = await cocoSsd.load();
//   const image = tf.browser.fromPixels(new Uint8Array(imageBuffer)); // Adjusted for browser-based TensorFlow
//   const predictions = await model.detect(image);
//   image.dispose(); // Clean up resources
//   return predictions;
// };


// Multer Configuration for File Uploads
const upload = multer({ dest: 'uploads/' });

// Object Detection Route
app.post('/detect', upload.single('image'), async (req, res) => {
  try {
    const imageBuffer = fs.readFileSync(req.file.path);

    const base64Image = imageBuffer.toString('base64'); // browser
    const predictions = await detectObjects(base64Image);
    // const predictions = await detectObjects(imageBuffer);

    const suspiciousObjects = predictions.filter(
      (p) => p.class === 'person' || p.class === 'bag'
    );
    const isUnauthorized = suspiciousObjects.some((obj) => obj.score > 0.7);

    if (isUnauthorized) {
      io.emit('alert', {
        message: 'Unauthorized activity detected!',
        details: suspiciousObjects,
      });
    }

    // Clean up the uploaded image
    fs.unlinkSync(req.file.path);

    res.json({
      message: isUnauthorized
        ? 'Unauthorized activity detected!'
        : 'No suspicious activity detected.',
      details: suspiciousObjects,
    });
  } catch (err) {
    console.error('Error during object detection:', err);
    res.status(500).json({ error: 'Error detecting objects.' });
  }
});


// WebSocket Events
io.on('connection', (socket) => {
  console.log('Admin connected to WebSocket');
  socket.on('disconnect', () => console.log('Admin disconnected'));
});


socket.on('alert', (data) => {
  console.log('Alert:', data.message);
  // Update the UI with the alert message
  document.getElementById('alerts').innerHTML += `<p>${data.message}</p>`;
});


server.listen(3000, () => console.log('Server running on port 3000'));


// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
