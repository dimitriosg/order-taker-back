import express from 'express';
import { join } from 'path';
import http from 'http';

const app = express();  // Create an Express app
const httpServer = http.createServer(app);  // Link the Express app to the HTTP server
const io = require("socket.io")(httpServer, {
  path: "/socket.io"
});

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('disconnect', () => {
    console.log('user disconnected');
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
