const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Photo = require('../models/Photo');

// @route   POST /api/photos
// @desc    Upload a new photo
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, imageUrls } = req.body;

    if (!title || !imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return res.status(400).json({ message: 'Title and at least one image are required' });
    }

    const photo = new Photo({
      title,
      description,
      imageUrl: imageUrls,
      user: req.userId
    });

    await photo.save();

    res.status(201).json({ message: 'Photo uploaded successfully', photo });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/photos
// @desc    Get all photos
// @access  Public
router.get('/', async (req, res) => {
  try {
    const photos = await Photo.find()
      .populate('user', 'fullName username profileImage')
      .sort({ createdAt: -1 });
    
    res.json(photos);
  } catch (error) {
    console.error('Get photos error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/photos/user/:userId
// @desc    Get photos by user
// @access  Public
router.get('/user/:userId', async (req, res) => {
  try {
    const photos = await Photo.find({ user: req.params.userId })
      .populate('user', 'fullName username profileImage')
      .sort({ createdAt: -1 });
    
    res.json(photos);
  } catch (error) {
    console.error('Get user photos error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/photos/:id
// @desc    Delete a photo
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);

    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }

    // Check if user owns the photo
    if (photo.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await photo.deleteOne();

    res.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
