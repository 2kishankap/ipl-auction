const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');

// Load env before requiring modules that read it at load time (e.g. redisService)
dotenv.config();

const connectDB = require('./config/db');
const socketHandler = require('./socket/socketHandler');
const { initTimerWorker } = require('./workers/timerWorker');

const teamRoutes = require('./routes/teamRoutes');
const playerRoutes = require('./routes/playerRoutes');
const auctionRoutes = require('./routes/auctionRoutes');
const auctionInstanceRoutes = require('./routes/auctionInstanceRoutes');
const leagueRoutes = require('./routes/leagueRoutes');
const miniAuctionRoutes = require('./routes/miniAuctionRoutes');

// Connect Database
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: process.env.CLIENT_URL || '*',
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Set io globally
app.set('io', io);

// API Routes
app.use('/api/teams', teamRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/auction', auctionRoutes);
app.use('/api/auctions', auctionInstanceRoutes);
app.use('/api/league', leagueRoutes);
app.use('/api/mini-auction', miniAuctionRoutes);

// Socket.io handlers
socketHandler(io);
initTimerWorker(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
