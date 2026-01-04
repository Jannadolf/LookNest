const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const Notification = require('../models/Notification');
const ProfileView = require('../models/ProfileView');

// @route   GET /api/user/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/user/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { fullName, username, phoneNumber, bio, gender, birthday, address, profileImage } = req.body;
    
    // Check if username is already taken
    if (username) {
      const existingUser = await User.findOne({ username });
      if (existingUser && existingUser._id.toString() !== req.userId) {
        return res.status(400).json({ message: 'Username already taken' });
      }
    }

    const updateData = {
      fullName,
      username,
      phoneNumber,
      bio,
      gender,
      birthday,
      address,
      profileImage
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updateData },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/:userId
// @desc    Get user profile by ID
// @access  Public
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Track profile view if viewer is authenticated and not viewing their own profile
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        const viewerId = decoded.userId;

        if (viewerId !== req.params.userId) {
          // Check if this viewer has viewed this profile recently (within last hour)
          const recentView = user.profileViews.find(view =>
            view.viewer.toString() === viewerId &&
            new Date() - new Date(view.viewedAt) < 60 * 60 * 1000 // 1 hour
          );

          if (!recentView) {
            user.profileViews.push({ viewer: viewerId });
            await user.save();
          }
        }
      } catch (error) {
        // Invalid token, continue without tracking
      }
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/:userId/follow
// @desc    Follow a user
// @access  Private
router.post('/:userId/follow', authMiddleware, async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.userId);
    const currentUser = await User.findById(req.userId);

    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.params.userId === req.userId) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    // Check if already following
    if (currentUser.following.includes(req.params.userId)) {
      return res.status(400).json({ message: 'Already following this user' });
    }

    // Add to following list of current user
    currentUser.following.push(req.params.userId);
    await currentUser.save();

    // Add to followers list of target user
    userToFollow.followers.push(req.userId);
    await userToFollow.save();

    // Create notification for the followed user
    const notification = new Notification({
      recipient: req.params.userId,
      sender: req.userId,
      type: 'follow',
      message: `${currentUser.fullName} started following you`
    });
    await notification.save();

    res.json({ message: 'User followed successfully' });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/users/:userId/follow
// @desc    Unfollow a user
// @access  Private
router.delete('/:userId/follow', authMiddleware, async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.userId);
    const currentUser = await User.findById(req.userId);

    if (!userToUnfollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove from following list of current user
    currentUser.following = currentUser.following.filter(id => id.toString() !== req.params.userId);
    await currentUser.save();

    // Remove from followers list of target user
    userToUnfollow.followers = userToUnfollow.followers.filter(id => id.toString() !== req.userId);
    await userToUnfollow.save();

    res.json({ message: 'User unfollowed successfully' });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/:userId/follow-status
// @desc    Check if current user is following the specified user
// @access  Private
router.get('/:userId/follow-status', authMiddleware, async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);
    const isFollowing = currentUser.following.includes(req.params.userId);
    
    res.json({ isFollowing });
  } catch (error) {
    console.error('Check follow status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/:userId/followers
// @desc    Get user's followers
// @access  Private
router.get('/:userId/followers', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const followers = await User.find({ _id: { $in: user.followers } }).select('username profilePicture');
    res.json(followers);
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/:userId/following
// @desc    Get users that this user is following
// @access  Private
router.get('/:userId/following', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const following = await User.find({ _id: { $in: user.following } }).select('username profilePicture');
    res.json(following);
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/:userId/views
// @desc    Get user's profile views
// @access  Private
router.get('/:userId/views', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only allow user to view their own profile views
    if (req.user.id !== req.params.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const views = await User.findById(req.params.userId).populate('profileViews.viewer', 'username profilePicture');
    res.json(views.profileViews);
  } catch (error) {
    console.error('Get views error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/users/:userId/followers/:followerId
// @desc    Remove a follower
// @access  Private
router.delete('/:userId/followers/:followerId', authMiddlewareMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const follower = await User.findById(req.params.followerId);

    if (!user || !follower) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only allow user to remove their own followers
    if (req.user.id !== req.params.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Remove follower from user's followers array
    user.followers = user.followers.filter(id => id.toString() !== req.params.followerId);
    await user.save();

    // Remove user from follower's following array
    follower.following = follower.following.filter(id => id.toString() !== req.params.userId);
    await follower.save();

    res.json({ message: 'Follower removed successfully' });
  } catch (error) {
    console.error('Remove follower error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
