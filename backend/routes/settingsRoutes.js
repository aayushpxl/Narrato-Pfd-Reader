const express = require('express');
const router = express.Router();
const UserSettings = require('../models/userSettingsModel');

// @desc    Get user settings
// @route   GET /api/settings/:userId
// @access  Public (for now)
router.get('/:userId', async (req, res) => {
  try {
    const settings = await UserSettings.findOne({ userId: req.params.userId });
    
    if (settings) {
      res.json(settings);
    } else {
      // Return default settings if none exist
      res.json({
        theme: 'light',
        voice: 'default',
        speechRate: 1.0,
        readingProgress: []
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Update user settings and reading progress
// @route   PUT /api/settings/:userId
// @access  Public
router.put('/:userId', async (req, res) => {
  try {
    const { theme, voice, speechRate, readingProgress } = req.body;
    
    let settings = await UserSettings.findOne({ userId: req.params.userId });

    if (settings) {
      settings.theme = theme || settings.theme;
      settings.voice = voice || settings.voice;
      settings.speechRate = speechRate || settings.speechRate;
      
      // Update reading progress for a specific PDF
      if (readingProgress && readingProgress.pdfId) {
        const existingProgressIndex = settings.readingProgress.findIndex(
          (p) => p.pdfId === readingProgress.pdfId
        );

        if (existingProgressIndex >= 0) {
          settings.readingProgress[existingProgressIndex].lastPageRead = readingProgress.lastPageRead;
        } else {
          settings.readingProgress.push(readingProgress);
        }
      }
      
      const updatedSettings = await settings.save();
      res.json(updatedSettings);
    } else {
       // Create new settings document if it doesn't exist
       let newProgress = [];
       if (readingProgress && readingProgress.pdfId) {
           newProgress.push(readingProgress);
       }

       settings = await UserSettings.create({
         userId: req.params.userId,
         theme: theme || 'light',
         voice: voice || 'default',
         speechRate: speechRate || 1.0,
         readingProgress: newProgress
       });
       res.status(201).json(settings);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
