import React, { useState, useEffect } from 'react';
import './MasonryGrid.css';

function MasonryGrid({ searchQuery, onUserClick }) {
  const [allPhotos, setAllPhotos] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCarousel, setShowCarousel] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchPhotos();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setPhotos(allPhotos);
    } else {
      const filtered = allPhotos.filter(photo => 
        photo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        photo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (photo.user && photo.user.fullName && photo.user.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (photo.user && photo.user.username && photo.user.username.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setPhotos(filtered);
    }
  }, [searchQuery, allPhotos]);

  const fetchPhotos = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/photos');
      const data = await response.json();
      setAllPhotos(data);
      setPhotos(data);
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = (photo) => {
    setCurrentPhoto(photo);
    setCurrentImageIndex(0);
    setShowCarousel(true);
  };

  if (loading) {
    return (
      <div className="masonry-grid">
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666', gridColumn: '1 / -1' }}>
          Loading photos...
        </div>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="masonry-grid">
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666', gridColumn: '1 / -1' }}>
          <p style={{ fontSize: '18px', marginBottom: '10px' }}>No photos yet</p>
          <p style={{ fontSize: '14px' }}>Upload your first photo to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="masonry-grid">
        {photos.map((photo) => (
          <div 
            key={photo._id} 
            className="masonry-item"
            onClick={() => handleImageClick(photo)}
          >
            <img src={photo.imageUrl[0]} alt={photo.title} style={{ width: '100%', display: 'block', borderRadius: '16px' }} />
            {photo.imageUrl.length > 1 && (
              <div className="image-count">+{photo.imageUrl.length - 1}</div>
            )}
            <div className="image-overlay">
              <div className="image-info">
                <h3 style={{ color: 'white', fontSize: '16px', margin: '0 0 4px' }}>{photo.title}</h3>
                {photo.description && <p style={{ color: 'white', fontSize: '13px', margin: 0 }}>{photo.description}</p>}
                {photo.user && (
                  <div 
                    style={{ color: 'white', fontSize: '12px', marginTop: '8px', opacity: 0.9, cursor: 'pointer' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onUserClick) {
                        onUserClick(photo.user._id);
                      }
                    }}
                  >
                    By <span style={{ textDecoration: 'underline' }}>{photo.user.fullName || photo.user.username}</span>
                  </div>
                )}
              </div>
              <div className="image-actions">
                <button className="action-btn save-btn">Save</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showCarousel && currentPhoto && (
        <div className="carousel-overlay" onClick={() => setShowCarousel(false)}>
          <div className="carousel-modal" onClick={(e) => e.stopPropagation()}>
            <button className="carousel-close" onClick={() => setShowCarousel(false)}>×</button>
            <div className="carousel-content">
              <img 
                src={currentPhoto.imageUrl[currentImageIndex]} 
                alt={`${currentPhoto.title} ${currentImageIndex + 1}`} 
                className="carousel-image"
              />
              {currentPhoto.imageUrl.length > 1 && (
                <>
                  <button 
                    className="carousel-nav carousel-prev"
                    onClick={() => setCurrentImageIndex((prev) => (prev - 1 + currentPhoto.imageUrl.length) % currentPhoto.imageUrl.length)}
                  >
                    ‹
                  </button>
                  <button 
                    className="carousel-nav carousel-next"
                    onClick={() => setCurrentImageIndex((prev) => (prev + 1) % currentPhoto.imageUrl.length)}
                  >
                    ›
                  </button>
                  <div className="carousel-indicators">
                    {currentPhoto.imageUrl.map((_, index) => (
                      <span 
                        key={index}
                        className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className="carousel-info">
              <h3>{currentPhoto.title}</h3>
              {currentPhoto.description && <p>{currentPhoto.description}</p>}
              {currentPhoto.user && (
                <div className="carousel-user">
                  By {currentPhoto.user.fullName || currentPhoto.user.username}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default MasonryGrid;
