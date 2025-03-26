const userProfile = require('../models/profile');
const logger = require('../utils/logger');

const addProfile = async (req, res, next) => {
    try {
        const { username, phone_number, dob, country, user_id, profile_img } = req.body;

        const profileData = { username, phone_number, dob, profile_img, country, user_id };
        const newProfile = await userProfile.createProfile(profileData);


        res.status(201).json({ message: 'Profile created successfully', profile: newProfile });
    } catch (error) {
        logger.error('Error creating profile', error);
        next(error);
    }
};

const editProfile = async (req, res, next) => {
  try {
      const { username, phone_number, dob, country, user_id, profile_img } = req.body;

      const profileData = { username, phone_number, dob, profile_img, country };
     
      // Ensure user_id exists
      if (!user_id) {
          return res.status(400).json({ message: 'User ID is required' });
      }

      const updatedProfile = await userProfile.updateProfile(user_id, profileData);

      res.status(200).json({ message: 'Profile updated successfully', profile: updatedProfile });
  } catch (error) {
      console.error('Error updating profile:', error);
      next(error);
  }
};


const checkProfileExists = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const profile = await userProfile.getProfileById(id);

        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        res.status(200).json({ message: 'Profile found', profile });
    } catch (error) {
        logger.error(`Error checking profile existence for user ID ${id}:`, error);
        next(error);
    }
};

module.exports = {
    addProfile,
    editProfile,
    checkProfileExists,
};
