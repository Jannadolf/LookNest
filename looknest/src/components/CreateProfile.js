import React, { useState } from 'react';
import './CreateProfile.css';

function CreateProfile({ onComplete, userData }) {
  const [formData, setFormData] = useState({
    fullName: userData?.fullName || '',
    username: '',
    email: userData?.email || '',
    phoneNumber: '',
    bio: '',
    gender: '',
    birthday: '',
    address: ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        // Compress the image
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Set max dimensions
          const maxWidth = 400;
          const maxHeight = 400;
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG with 0.7 quality
          const compressedImage = canvas.toDataURL('image/jpeg', 0.7);
          setImagePreview(compressedImage);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      // Send as JSON (only include profileImage if it exists and is not too large)
      const dataToSend = {
        ...formData
      };
      
      // Only include image if it exists and is reasonable size
      if (imagePreview && imagePreview.length < 1000000) {
        dataToSend.profileImage = imagePreview;
      }

      const response = await fetch('http://localhost:5000/api/user/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      const data = await response.json();

      if (response.ok) {
        // Update user data in localStorage
        const currentUser = JSON.parse(localStorage.getItem('user'));
        localStorage.setItem('user', JSON.stringify({
          ...currentUser,
          ...data.user
        }));
        
        onComplete();
      } else {
        setError(data.message || 'Failed to create profile');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Profile creation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-profile-overlay">
      <div className="create-profile-container">
        <div className="create-profile-header">
          <h2>Complete Your Profile</h2>
          <p>Tell us more about yourself</p>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          {error && <div className="error-message">{error}</div>}

          {/* Profile Picture Upload */}
          <div className="profile-picture-section">
            <div className="profile-picture-preview">
              {imagePreview ? (
                <img src={imagePreview} alt="Profile preview" />
              ) : (
                <div className="placeholder-avatar">
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
              )}
            </div>
            <label className="upload-photo-btn">
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
              Upload Profile Photo
            </label>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Full Name *</label>
              <input 
                type="text" 
                name="fullName"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Username *</label>
              <input 
                type="text" 
                name="username"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Email *</label>
              <input 
                type="email" 
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input 
                type="tel" 
                name="phoneNumber"
                placeholder="Enter your phone number"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Bio / About Me</label>
            <textarea 
              name="bio"
              placeholder="Tell us about yourself..."
              value={formData.bio}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Gender</label>
              <select 
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>

            <div className="form-group">
              <label>Birthday</label>
              <input 
                type="date" 
                name="birthday"
                value={formData.birthday}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Address</label>
            <input 
              type="text" 
              name="address"
              placeholder="Enter your address"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="submit-profile-btn" disabled={loading}>
            {loading ? 'Creating Profile...' : 'Complete Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateProfile;
