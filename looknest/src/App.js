import React, { useState, useEffect } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import MasonryGrid from './components/MasonryGrid';
import NotificationPanel from './components/NotificationPanel';
import UploadModal from './components/UploadModal';
import Dashboard from './components/Dashboard';
import Messages from './components/Messages';
import LandingPage from './components/LandingPage';
import CreateProfile from './components/CreateProfile';
import Profile from './components/Profile';
import UserProfile from './components/UserProfile';
import { initSocket } from './socket';

function App() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [currentView, setCurrentView] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [newUserData, setNewUserData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => {
    initSocket();
  }, []);

  const handleSignupComplete = (userData) => {
    setNewUserData(userData);
    setShowCreateProfile(true);
  };

  const handleProfileComplete = () => {
    setShowCreateProfile(false);
    setIsLoggedIn(true);
  };

  const handleUploadSuccess = () => {
    setRefreshKey(prev => prev + 1); // Trigger refresh
    setCurrentView('home'); // Switch to home view
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setCurrentView('home');
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentView('home'); // Switch to home view to show search results
  };

  const handleUserClick = (userId) => {
    setSelectedUserId(userId);
    setCurrentView('user-profile');
  };

  const handleMessage = (user) => {
    // For now, just switch to messages view
    // In a real app, you'd want to start a conversation with this user
    setCurrentView('messages');
  };

  if (!isLoggedIn && !showCreateProfile) {
    return <LandingPage onLogin={() => setIsLoggedIn(true)} onSignupComplete={handleSignupComplete} />;
  }

  if (showCreateProfile) {
    return <CreateProfile onComplete={handleProfileComplete} userData={newUserData} />;
  }

  return (
    <div className="App">
      <Navbar onProfileClick={() => setCurrentView('profile')} onSearch={handleSearch} />
      <Sidebar 
        onNotificationClick={() => setShowNotifications(!showNotifications)}
        onUploadClick={() => setShowUpload(true)}
        onViewChange={setCurrentView}
        currentView={currentView}
        onLogout={handleLogout}
      />
      <NotificationPanel 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
      <UploadModal 
        isOpen={showUpload} 
        onClose={() => setShowUpload(false)}
        onUploadSuccess={handleUploadSuccess}
      />
      <main className="main-content">
        {currentView === 'home' && <MasonryGrid key={refreshKey} searchQuery={searchQuery} onUserClick={handleUserClick} />}
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'messages' && <Messages />}
        {currentView === 'profile' && <Profile />}
        {currentView === 'user-profile' && <UserProfile userId={selectedUserId} onMessage={handleMessage} />}
      </main>
    </div>
  );
}

export default App;
