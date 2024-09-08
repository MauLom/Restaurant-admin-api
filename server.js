require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const { init } = require('./websocket'); 
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

init(server)
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
