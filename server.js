// server.js
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const app = express();

const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://order-taker-front-8e7edf8fac75.herokuapp.com'
  ],  // Allow both your local and deployed frontends
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
};

// Set up CORS
app.use(cors(corsOptions));

const httpServer = createServer(app);

// Apply CORS options to Socket.io as well
const io = new Server(httpServer, {
  path: "/socket.io",
  cors: corsOptions
});

io.on('connection', (socket) => {
  console.log('A user connected with socket id:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected with socket id:', socket.id);
  });

  socket.on('message', (msg) => {
    io.emit('message', msg);
  });
});

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Serve static files from the React app
app.use(express.static(join(__dirname, 'frontend/build')));

// The "catchall" handler: for any request that doesn't match one above, send back React's index.html file.
if (process.env.NODE_ENV === 'production') {
  // Only use the catchall handler in production
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname + '/build/index.html'));
  });
}

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
