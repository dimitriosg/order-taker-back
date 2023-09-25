import { join } from 'path';

const httpServer = require("http").createServer();
const io = require("socket.io")(httpServer, {
  path: "/socket.io"
});

// Serve static files from the React app
app.use(express.static(join(__dirname, 'frontend/build')));

// The "catchall" handler: for any request that doesn't match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(join(__dirname + '/frontend/build/index.html'));
});

httpServer.listen();
