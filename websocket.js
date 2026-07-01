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

      socket.on('join-room', ({ role, userId }) => {
        if (role === 'waiter') {
          socket.join(`waiter-${userId}`);
          console.log(`Socket ${socket.id} joined waiter-${userId}`);
        } else if (role === 'cashier') {
          socket.join('cashier');
          console.log(`Socket ${socket.id} joined cashier`);
        } else {
          socket.join(`kitchen-${role}`);
          console.log(`Socket ${socket.id} joined kitchen-${role}`);
        }
      });

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
