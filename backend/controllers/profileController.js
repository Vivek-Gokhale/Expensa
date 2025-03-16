const userProfile = require('../models/profile');
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs');
const config = require('../utils/config');

const saveImage = (imageData, originalName) => {
  const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
  
  
  let uniqueName = `${timestamp}_${originalName}`;
  if(config.mode == 'development')
  {
      uniqueName = `${config.backendurl}/profile-image/${uniqueName}`;
  }
  const imagePath = path.join(__dirname, '..', 'images', uniqueName);

  fs.writeFileSync(imagePath, imageData);

  return uniqueName;
};

const addProfile = async (req, res, next) => {
  try {
    const { username, phone_number, dob, country, user_id } = req.body;
    let profile_img = null;

    if (req.file) {
      profile_img = saveImage(req.file.buffer, req.file.originalname);
    }

    const profileData = { username, phone_number, dob, profile_img, country, user_id };
    const newProfile = await userProfile.createProfile(profileData);

    if (!newProfile) {
      return res.status(400).json({ message: 'Profile creation failed' });
    }

    res.status(201).json({ message: 'Profile created successfully', profile: newProfile });
  } catch (error) {
    logger.error('Error creating profile', error);
    next(error);
  }
};

const editProfile = async (req, res, next) => {
  try {
    const { id, username, phone_number, dob, country } = req.body;
    let profile_img = null;

    if (req.file) {
      profile_img = saveImage(req.file.buffer, req.file.originalname);
    }

    const profileData = { username, phone_number, dob, profile_img, country };
    const updatedProfile = await userProfile.updateProfile(id, profileData);

    if (!updatedProfile) {
      return res.status(404).json({ message: 'Profile not found or update failed' });
    }

    res.status(200).json({ message: 'Profile updated successfully', profile: updatedProfile });
  } catch (error) {
    logger.error('Error updating profile', error);
    next(error);
  }
};

const checkProfileExists = async (req, res, next) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const profile = await userProfile.getProfileById(userId);

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.status(200).json({ message: 'Profile found', profile });
  } catch (error) {
    logger.error('Error checking profile existence', error);
    next(error);
  }
};

module.exports = {
  addProfile,
  editProfile,
  checkProfileExists,
};
