const redis = require("redis");
const io = require("socket.io");

const redisClient = redis.createClient({ host: "redis", port: 6379 });

redisClient.subscribe("ticket_events");

const server = require("http").createServer();
const ioServer = io(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Health check endpoint
server.on("request", (req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    const healthStatus = {
      status: "healthy",
      service: "notification-service",
      timestamp: new Date().toISOString(),
      checks: {}
    };

    // Check Redis connection
    if (redisClient.connected) {
      healthStatus.checks.redis = "healthy";
    } else {
      healthStatus.status = "unhealthy";
      healthStatus.checks.redis = "unhealthy: not connected";
    }

    // Check Socket.IO server
    if (ioServer.engine.clientsCount >= 0) {
      healthStatus.checks.websocket = "healthy";
      healthStatus.connected_clients = ioServer.engine.clientsCount;
    } else {
      healthStatus.status = "unhealthy";
      healthStatus.checks.websocket = "unhealthy: socket server error";
    }

    const statusCode = healthStatus.status === "healthy" ? 200 : 503;
    res.writeHead(statusCode, { "Content-Type": "application/json" });
    res.end(JSON.stringify(healthStatus));
    return;
  }
});

ioServer.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
});

redisClient.on("message", (channel, message) => {
  console.log("Received event:", message);
  const event = JSON.parse(message);
  ioServer.emit("notification", event);
});

const port = process.env.PORT || 8083;
server.listen(port, () => {
  console.log(`Notification service listening on port ${port}`);
});
