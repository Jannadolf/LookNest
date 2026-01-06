import React, { useState, useEffect } from 'react';
import './Profile.css';

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const userData = await response.json();
      if (response.ok) {
        setUser(userData);
      } else {
        console.error('Failed to fetch profile:', userData.message);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/user/profile/followers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setFollowersList(data);
      setShowFollowersModal(true);
    } catch (error) {
      console.error('Error fetching followers:', error);
    }
  };

  const fetchFollowing = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/user/profile/following', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setFollowingList(data);
      setShowFollowingModal(true);
    } catch (error) {
      console.error('Error fetching following:', error);
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-container">
        <div className="error">No user data found</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
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
          {user.username && <p className="profile-username">@{user.username}</p>}
          {user.bio && <p className="profile-bio">{user.bio}</p>}

          <div className="profile-stats">
            <div className="stat-item clickable" onClick={fetchFollowers}>
              <span className="stat-number">{user.followers?.length || 0}</span>
              <span className="stat-label">Followers</span>
            </div>
            <div className="stat-item clickable" onClick={fetchFollowing}>
              <span className="stat-number">{user.following?.length || 0}</span>
              <span className="stat-label">Following</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{Array.isArray(user.profileViews) ? user.profileViews.length : (user.profileViews || 0)}</span>
              <span className="stat-label">Views</span>
            </div>
          </div>

          <div className="profile-details">
            <h3>Profile Details</h3>
            <div className="detail-grid">
              {user.email && (
                <div className="detail-item">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                  <div>
                    <label>Email</label>
                    <span>{user.email}</span>
                  </div>
                </div>
              )}

              {user.phoneNumber && (
                <div className="detail-item">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                  </svg>
                  <div>
                    <label>Phone</label>
                    <span>{user.phoneNumber}</span>
                  </div>
                </div>
              )}

              {user.gender && (
                <div className="detail-item">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                  <div>
                    <label>Gender</label>
                    <span>{user.gender.charAt(0).toUpperCase() + user.gender.slice(1)}</span>
                  </div>
                </div>
              )}

              {user.birthday && (
                <div className="detail-item">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/>
                  </svg>
                  <div>
                    <label>Birthday</label>
                    <span>{new Date(user.birthday).toLocaleDateString()}</span>
                  </div>
                </div>
              )}

              {user.address && (
                <div className="detail-item">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  <div>
                    <label>Address</label>
                    <span>{user.address}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showFollowersModal && (
        <div className="modal-overlay" onClick={() => setShowFollowersModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Followers</h2>
            <div className="modal-list">
              {followersList.length === 0 ? (
                <p>No followers yet</p>
              ) : (
                followersList.map((follower) => (
                  <div key={follower._id} className="list-item">
                    <img src={follower.profileImage || '/default-avatar.png'} alt={follower.fullName} className="list-avatar" />
                    <span>{follower.fullName} {follower.status === 'pending' && '(Pending)'}</span>
                  </div>
                ))
              )}
            </div>
            <button className="close-btn" onClick={() => setShowFollowersModal(false)}>Close</button>
          </div>
        </div>
      )}

      {showFollowingModal && (
        <div className="modal-overlay" onClick={() => setShowFollowingModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Following</h2>
            <div className="modal-list">
              {followingList.length === 0 ? (
                <p>Not following anyone yet</p>
              ) : (
                followingList.map((following) => (
                  <div key={following._id} className="list-item">
                    <img src={following.profileImage || '/default-avatar.png'} alt={following.fullName} className="list-avatar" />
                    <span>{following.fullName}</span>
                  </div>
                ))
              )}
            </div>
            <button className="close-btn" onClick={() => setShowFollowingModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
