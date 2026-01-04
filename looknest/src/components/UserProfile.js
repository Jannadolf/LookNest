import React, { useState, useEffect, useCallback } from 'react';
import './UserProfile.css';

function UserProfile({ userId, onMessage }) {
  const [user, setUser] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  const checkFollowStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/user/${userId}/follow-status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setIsFollowing(data.isFollowing);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  }, [userId]);

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/user/${userId}`);
      const userData = await response.json();
      if (response.ok) {
        setUser(userData);
        setFollowersCount(userData.followers?.length || 0);
        // Check if current user is following this user (only if logged in)
        const token = localStorage.getItem('token');
        if (token) {
          checkFollowStatus();
        }
      } else {
        console.error('Failed to fetch user profile:', userData.message);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  }, [userId, checkFollowStatus]);

  const fetchUserPhotos = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/photos/user/${userId}`);
      const photosData = await response.json();
      setPhotos(photosData);
    } catch (error) {
      console.error('Error fetching user photos:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
      fetchUserPhotos();
    } else {
      setLoading(false);
    }
  }, [userId, fetchUserProfile, fetchUserPhotos]);

  const handleFollow = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      // User is not logged in, redirect to login
      alert('Please log in to follow users');
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5000/api/user/${userId}/follow`, {
        method: isFollowing ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setIsFollowing(!isFollowing);
        setFollowersCount(prev => isFollowing ? prev - 1 : prev + 1);
      } else {
        const errorData = await response.json();
        console.error('Follow/unfollow failed:', errorData.message);
      }
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
    }
  };

  const handleMessage = () => {
    if (onMessage) {
      onMessage(user);
    }
  };

  if (loading) {
    return (
      <div className="user-profile-container">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="user-profile-container">
        <div className="error">User not found</div>
      </div>
    );
  }

  return (
    <div className="user-profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-cover"></div>
          <div className="profile-avatar-section">
            {user.profileImage ? (
              <img src={user.profileImage} alt={user.fullName} className="profile-avatar-large" />
            ) : (
              <div className="profile-avatar-large placeholder">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
            )}
          </div>
        </div>

        <div className="profile-info">
          <h1 className="profile-name">{user.fullName}</h1>
          <p className="profile-username">@{user.username}</p>
          {user.bio && <p className="profile-bio">{user.bio}</p>}

          <div className="profile-stats">
            <div className="stat">
              <span className="stat-number">{photos.length}</span>
              <span className="stat-label">Posts</span>
            </div>
            <div className="stat">
              <span className="stat-number">{followersCount}</span>
              <span className="stat-label">Followers</span>
            </div>
            <div className="stat">
              <span className="stat-number">{user.following?.length || 0}</span>
              <span className="stat-label">Following</span>
            </div>
          </div>

          <div className="profile-actions">
            {localStorage.getItem('token') ? (
              <>
                <button
                  className={`follow-btn ${isFollowing ? 'following' : ''}`}
                  onClick={handleFollow}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
                <button className="message-btn" onClick={handleMessage}>
                  Message
                </button>
              </>
            ) : (
              <p className="login-prompt">Please log in to follow and message users</p>
            )}
          </div>
        </div>
      </div>

      <div className="user-photos-grid">
        {photos.length === 0 ? (
          <div className="no-photos">
            <p>No photos yet</p>
          </div>
        ) : (
          photos.map((photo) => (
            <div key={photo._id} className="user-photo-item">
              <img src={photo.imageUrl[0]} alt={photo.title} />
              {photo.imageUrl.length > 1 && (
                <div className="photo-count">+{photo.imageUrl.length - 1}</div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default UserProfile;