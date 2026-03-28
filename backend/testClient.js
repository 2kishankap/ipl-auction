const io = require('socket.io-client');
const axios = require('axios');

const API_URL = 'http://localhost:5001/api';
const SOCKET_URL = 'http://localhost:5001';

async function runTests() {
    try {
        console.log('--- Starting Tests ---');
        // 1. Join Team
        const resTeam = await axios.post(`${API_URL}/teams/join`, {
            ownerName: 'Test Owner',
            teamName: 'Test Team',
            isAdmin: true
        });
        const teamId = resTeam.data.team._id;
        console.log(`Team joined: ${teamId}`);

        // 2. Add Player
        const resPlayer = await axios.post(`${API_URL}/players/add`, {
            name: 'Virat Kohli',
            role: 'BAT',
            country: 'India',
            isOverseas: false,
            iplTeam: 'RCB',
            basePrice: 20000000 // 2 Cr
        });
        console.log(`Player added: ${resPlayer.data.player.name}`);

        // 3. Connect Socket
        const socket = io(SOCKET_URL);
        
        socket.on('connect', () => {
            console.log('Socket connected:', socket.id);
            socket.emit('joinAuction', { teamId });
        });

        socket.on('auctionUpdate', (state) => {
            console.log('Auction Update:', state);
        });

        socket.on('error', (err) => {
            console.error('Socket Error:', err);
        });

        socket.on('playerSold', (data) => {
            console.log('Player Sold:', data.player.name, 'to', data.team.teamName, 'for', data.soldPrice);
            process.exit(0);
        });

        socket.on('markUnsold', (data) => {
            console.log('Player Unsold:', data.player.name);
            process.exit(0);
        });

        // 4. Start Auction
        setTimeout(async () => {
            try {
                const resStart = await axios.post(`${API_URL}/auction/start`);
                console.log('Auction Started:', resStart.data.message);

                // 5. Place Bid
                setTimeout(() => {
                    console.log('Placing bid...');
                    socket.emit('placeBid', { teamId });
                }, 1000);

            } catch (err) {
                console.error('API Error:', err.response?.data || err.message);
            }
        }, 1000);

    } catch (err) {
        console.error('Error in testing:', err.response?.data || err.message);
        process.exit(1);
    }
}

runTests();
