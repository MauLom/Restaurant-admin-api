let io;

module.exports = {
  init: (server) => {
    io = require('socket.io')(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT']
      }
    });

    io.on('connection', (socket) => {
      console.log('A client connected:', socket.id);
      
      socket.on('test', (data) => {
        console.log('Received test event:', data);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error("Socket.io not initialized!");
    }
    return io;
  }
};
