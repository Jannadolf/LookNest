import React, { useState } from 'react';
import './Sidebar.css';

function Sidebar({ onNotificationClick, onUploadClick, onViewChange, currentView, onLogout }) {
  const [activeItem, setActiveItem] = useState(currentView || 'home');

  const handleItemClick = (itemName, callback) => {
    setActiveItem(itemName);
    if (onViewChange && (itemName === 'home' || itemName === 'dashboard' || itemName === 'messages')) {
      onViewChange(itemName);
    }
    if (callback) callback();
  };

  return (
    <div className="sidebar">
      <div className="sidebar-top">
        {/* Home */}
        <button 
          className={`sidebar-item ${activeItem === 'home' ? 'active' : ''}`}
          title="Home"
          onClick={() => handleItemClick('home')}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
          </svg>
        </button>
        
        {/* Dashboard */}
        <button 
          className={`sidebar-item ${activeItem === 'dashboard' ? 'active' : ''}`}
          title="Dashboard"
          onClick={() => handleItemClick('dashboard')}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 4h7v7H4V4zm9 0h7v7h-7V4zm0 9h7v7h-7v-7zm-9 0h7v7H4v-7z"/>
          </svg>
        </button>
        
        {/* Notification */}
        <button 
          className={`sidebar-item ${activeItem === 'notification' ? 'active' : ''}`}
          title="Notifications"
          onClick={() => handleItemClick('notification', onNotificationClick)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
          </svg>
        </button>
        
        {/* Create/Upload Photo */}
        <button 
          className={`sidebar-item ${activeItem === 'upload' ? 'active' : ''}`}
          title="Upload Photo"
          onClick={() => handleItemClick('upload', onUploadClick)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
        </button>
        
        {/* Messages */}
        <button 
          className={`sidebar-item ${activeItem === 'messages' ? 'active' : ''}`}
          title="Messages"
          onClick={() => {
            handleItemClick('messages');
            if (onViewChange) {
              onViewChange('messages');
            }
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
          </svg>
        </button>
      </div>
      
      <div className="sidebar-bottom">
        {/* Logout */}
        <button 
          className={`sidebar-item ${activeItem === 'logout' ? 'active' : ''}`}
          title="Logout"
          onClick={() => {
            if (onLogout) {
              onLogout();
            }
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
