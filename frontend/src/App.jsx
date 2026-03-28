import React from 'react';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import AuctionDashboard from './components/AuctionDashboard';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import AuctionListPage from './components/AuctionListPage';
import LeagueDashboard from './components/LeagueDashboard';
import LeagueMatches from './components/LeagueMatches';
import LeagueLineups from './components/LeagueLineups';
import MatchPointsEntry from './components/MatchPointsEntry';
import LeagueLeaderboard from './components/LeagueLeaderboard';
import LeagueReleases from './components/LeagueReleases';
import MiniAuction from './components/MiniAuction';
import PublicLeaderboard from './components/PublicLeaderboard';

const AuctionRoom = () => {
    const { auctionId } = useParams();
    return (
        <SocketProvider auctionId={auctionId}>
            <AuctionDashboard />
        </SocketProvider>
    );
};

const AnalyticsRoom = () => {
    const { auctionId } = useParams();
    return (
        <SocketProvider auctionId={auctionId}>
            <AnalyticsDashboard />
        </SocketProvider>
    );
};

function App() {
  return (
    <BrowserRouter>
        <div className="min-h-screen text-slate-100 font-inter">
          <Routes>
            <Route path="/" element={<AuctionListPage />} />
            <Route path="/auction/:auctionId" element={<AuctionRoom />} />
            <Route path="/auction/:auctionId/analytics" element={<AnalyticsRoom />} />
            <Route path="/auction/:auctionId/league" element={<LeagueDashboard />} />
            <Route path="/auction/:auctionId/league/week/:weekId/matches" element={<LeagueMatches />} />
            <Route path="/auction/:auctionId/league/week/:weekId/lineups" element={<LeagueLineups />} />
            <Route path="/auction/:auctionId/league/week/:weekId/matches/:matchId/points" element={<MatchPointsEntry />} />
            <Route path="/auction/:auctionId/league/week/:weekId/leaderboard" element={<LeagueLeaderboard />} />
            <Route path="/auction/:auctionId/league/week/:weekId/releases" element={<LeagueReleases />} />
            <Route path="/auction/:auctionId/league/week/:weekId/mini-auction" element={<MiniAuction />} />
            
            {/* Public Read-Only Route */}
            <Route path="/public/auction/:auctionId/league/week/:weekId/leaderboard" element={<PublicLeaderboard />} />
          </Routes>
        </div>
    </BrowserRouter>
  );
}

export default App;
