const mongoose = require('mongoose');

const userSettingsSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  theme: {
    type: String,
    default: 'light',
    enum: ['light', 'dark']
  },
  voice: {
    type: String,
    default: 'default'
  },
  speechRate: {
    type: Number,
    default: 1.0
  },
  readingProgress: [{
    pdfId: String,
    lastPageRead: Number,
    bookmarks: [Number]
  }]
}, { timestamps: true });

const UserSettings = mongoose.model('UserSettings', userSettingsSchema);

module.exports = UserSettings;
