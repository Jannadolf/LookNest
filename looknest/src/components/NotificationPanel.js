import React, { useState, useEffect } from 'react';
import './NotificationPanel.css';

function NotificationPanel({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (senderId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/user/${senderId}/follow/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      // Refresh notifications
      fetchNotifications();
    } catch (error) {
      console.error('Error accepting follow request:', error);
    }
  };

  const handleReject = async (senderId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/user/${senderId}/follow/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      // Refresh notifications
      fetchNotifications();
    } catch (error) {
      console.error('Error rejecting follow request:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="notification-overlay" onClick={onClose}></div>
      <div className="notification-panel">
        <div className="notification-header">
          <h2>Updates</h2>
        </div>
        
        <div className="notification-content">
          {loading ? (
            <div className="loading">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="no-notifications">No notifications yet</div>
          ) : (
            notifications.map(notification => (
              <div key={notification._id} className={`notification-item ${notification.isRead ? 'seen' : 'new'}`}>
                <div className="notification-thumbnail">
                  <img src={notification.sender?.profileImage || '/default-avatar.png'} alt={notification.sender?.fullName} />
                </div>
                <div className="notification-details">
                  <p className="notification-title">{notification.message}</p>
                  {notification.type === 'follow_request' && (
                    <div className="follow-actions">
                      <button className="accept-btn" onClick={() => handleAccept(notification.sender._id)}>Accept</button>
                      <button className="reject-btn" onClick={() => handleReject(notification.sender._id)}>Reject</button>
                    </div>
                  )}
                </div>
                <div className="notification-meta">
                  <span className="notification-time">{new Date(notification.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default NotificationPanel;
