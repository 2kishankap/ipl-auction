import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = '/'; // Empty/root path so Vite proxy (and ngrok) handles it seamlessly

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children, auctionId }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncedTeams, setSyncedTeams] = useState(null);
  const [auctionState, setAuctionState] = useState({
    currentPlayer: null,
    currentBid: 0,
    highestBidderTeamId: null,
    highestBidderTeamName: null,
    timerEndTime: null,
    auctionStatus: 'WAITING',
  });
  const [soldEvent, setSoldEvent] = useState(null);
  const [unsoldEvent, setUnsoldEvent] = useState(null);
  const [revertEvent, setRevertEvent] = useState(null);

  useEffect(() => {
    if (!auctionId) return; // Wait for route param binding
    
    const newSocket = io(SOCKET_URL);
    
    newSocket.on('connect', () => {
      setIsConnected(true);
      setIsSyncing(true);
      newSocket.emit('joinAuction', { auctionId });
      newSocket.emit('syncStateRequest', { auctionId });
      console.log(`Connected to socket server for Auction ${auctionId}, requesting state sync...`);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from socket server');
    });

    // Auction Updates
    newSocket.on('auctionUpdate', (state) => {
      setAuctionState(state);
    });

    newSocket.on('auctionStateSync', (payload) => {
      const { teamDataList, upcomingPlayersQueue, ...state } = payload;
      setAuctionState({ ...state, upcomingPlayers: upcomingPlayersQueue });
      setSyncedTeams(teamDataList);
      setIsSyncing(false);
      console.log('Socket fully state-synced!');
    });

    newSocket.on('newPlayer', (state) => {
      setAuctionState(state);
      setSoldEvent(null);
      setUnsoldEvent(null);
    });

    newSocket.on('playerSold', (data) => {
      setSoldEvent(data); // { player, team, soldPrice }
      setAuctionState(prev => ({ ...prev, auctionStatus: 'SOLD' }));
    });

    newSocket.on('markUnsold', (data) => {
      setUnsoldEvent(data); // { player }
      setAuctionState(prev => ({ ...prev, auctionStatus: 'WAITING' }));
    });

    newSocket.on('playerReverted', () => {
      setRevertEvent(Date.now());
    });

         setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected, isSyncing, syncedTeams, auctionState, soldEvent, unsoldEvent, revertEvent, auctionId }}>
      {children}
    </SocketContext.Provider>
  );
};
