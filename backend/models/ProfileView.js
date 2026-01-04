const mongoose = require('mongoose');

const profileViewSchema = new mongoose.Schema({
  profileOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  viewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  viewedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
profileViewSchema.index({ profileOwner: 1, viewedAt: -1 });

module.exports = mongoose.model('ProfileView', profileViewSchema);