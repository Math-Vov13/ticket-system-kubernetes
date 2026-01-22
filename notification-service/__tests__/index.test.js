const { createServer } = require('http');
const { Server } = require('socket.io');

test('should create server', () => {
  const server = createServer();
  const io = new Server(server);
  expect(server).toBeDefined();
  expect(io).toBeDefined();
});