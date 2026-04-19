import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import GalaxyPage from './pages/GalaxyPage';
import AuthCallback from './pages/AuthCallback';
import PublicGalaxy from './pages/PublicGalaxy';
import ExplorePage from './pages/ExplorePage';
import './styles/global.css';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="loading-cosmos"><div className="cosmos-spinner" /></div>;
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/galaxy" element={<ProtectedRoute><GalaxyPage /></ProtectedRoute>} />
          <Route path="/galaxy/:username" element={<PublicGalaxy />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
