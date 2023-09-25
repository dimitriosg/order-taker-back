import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { join } from 'path';
import cors from 'cors';

const app = express();

// Set up CORS
app.use(cors({
  origin: 'https://order-taker-front-8e7edf8fac75.herokuapp.com',  // replace with your frontend app's URL
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));

// Apply CORS middleware to Express
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


// Serve static files from the React app
app.use(express.static(join(__dirname, 'frontend/build')));

// The "catchall" handler: for any request that doesn't match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(join(__dirname + '/frontend/build/index.html'));
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
