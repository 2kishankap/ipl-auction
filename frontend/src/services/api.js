import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api'; // Use dynamic URL in prod, fallback to relative proxy in dev
export const api = axios.create({
  baseURL: API_URL,
});

export const joinTeam = async (ownerName, teamName, auctionId, isAdmin = false) => {
  try {
    const res = await api.post('/teams/join', { ownerName, teamName, auctionId, isAdmin });
    return res.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
