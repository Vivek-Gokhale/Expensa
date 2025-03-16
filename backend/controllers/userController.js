const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const crypto = require('crypto');
const { sendResetEmail } = require('../utils/mailer');
const config = require('../utils/config');



const registerUser = async (req, res, next) => {
    try {
      const { email, password } = req.body;

      // Check if staff with email already exists
        const existingUser = await User.getByEmail(email);
        if (existingUser) {
          return res.status(400).json({ message: 'User with this email already exists' });
        }

      // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new staff
        const newUser = await User.create({ username, password: hashedPassword, email });
        res.status(201).json({ message: 'User registered successfully', userId: newUser.id });
    } catch (error) {
      logger.error('Error registering User', error);
      next(error);
    }
};

const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.getByEmail(email);

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
          // Generate JWT token
          const token = jwt.sign({ userId: user.id, email: user.email }, config.jwtSecret, {
            expiresIn: '1h',
          });

        res.json({ token, userId: user.id, userEmail: user.email, message: 'Login successful' });
    } catch (error) {
      logger.error('Error logging in User', error);
      next(error);
    }
};

const requestPasswordReset = async (req, res, next) => {
  try {
      const { email } = req.body;
      const user = await User.getByEmail(email);

      if (!user) {
          return res.status(404).json({ message: 'User with this email not found' });
      }

      // Generate 4-digit OTP
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      const otpExpiry = Date.now() + 300; // 5 minutes expiration

      // Store OTP in the database
      await User.setOtp(user.id, otp, otpExpiry);
      
      // Send OTP email
      const message = `Your password reset OTP is: ${otp}. It will expire in 5 minutes.`;
      await sendResetEmail(email, message);

      res.json({ message: 'Password reset OTP sent' });
  } catch (error) {
      logger.error('Error requesting password reset', error);
      next(error);
  }
};

const resetPassword = async (req, res, next) => {
    try {
      const { otp, newPassword } = req.body;
      const user = await User.getByResetToken(token);

        if (!user) {
            return res.status(400).json({ message: 'Invalid otp' });
        }

        if (user.resetTokenExpiry < Date.now()) {
            return res.status(400).json({ message: 'otp expired' });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        await User.updatePassword(user.id, hashedPassword);
        await User.clearResetToken(user.id);

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        logger.error('Error resetting password', error);
        next(error);
    }
};

module.exports = {
    registerUser,
    loginUser,
    requestPasswordReset,
    resetPassword,
};
