import axios from 'axios';

const API_URL = '/api'; // Using relative path so Vite proxy (and ngrok) handles it seamlessly
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
