import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { join } from 'path';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  path: "/socket.io"
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
