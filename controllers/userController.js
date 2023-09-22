import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
//import nodemailer from 'nodemailer';
//import mailgun from 'mailgun-js'; // Import mailgun-js module
import { config } from 'dotenv';

config();

// Function to create a new user
export const createUser = async (req, res) => {
  console.log(`CONSOLE: Entered createUser function`);
  try {
    const { name, email, password, role } = req.body;
    console.log(`Name: ${name}, Email: ${email}, Password: ${password}, Role: ${role}`);

    // Check if email and password are provided
    if (!email || !password || typeof password !== 'string') {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationTokenExpiration = Date.now() + 3600000; // 1 hour

    // Create the new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      emailVerificationToken,
      emailVerificationTokenExpiration
    });
    await newUser.save();

    // Send email for verification
    sendEmail(
      newUser.email, 
      'Verify Your Email', 
      `Click here to verify: http://order-taker.dgalanopoulos.eu/verify-email/${emailVerificationToken}`
  );

    res.status(201).json(newUser);
  } catch (error) {
    console.error("Error Details:", error);
    res.status(400).json({ message: 'Error creating user', error: error.message });
  }
};

// Function to authenticate a user
export const authenticateUser = async (req, res) => {
  console.log(`CONSOLE: Entered authenticateUser function`);
  try{
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if(!user){
      return res.status(401).json({message: 'User not found' });
    }

    // Check if the account is locked
    if(user.accountStatus == 'Locked' || user.accountStatus == 'Deactivated') {
      res.status(401).json({message: `Cannot access account. Status: ${user.accountLocked}` });
      return;
    }

    const isPasswordValid  = await bcrypt.compare(password, user.password);
    if(!isPasswordValid){
      return res.status(401).json({message: 'Invalid credentials' });
    }

    // Include user role in the JWT payload
    //const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });


    return res.status(200).json({ token });
  }catch(error){
    return res.status(400).json({message: 'Authentication failed', error });
  }
};

// Function to update a user
export const updateUser = async (req, res) => {
  console.log(`CONSOLE: Entered updateUser function`);
  console.log("req.params:", req.params);
  try{
    const id = req.params.userID;
    console.log("UserID:", id);  // Then log it to the console

    const updateUser = await User.findByIdAndUpdate(id, req.body, { new: true });
    console.log("Updated User:", updateUser);
    res.status(200).json(updateUser);
  }catch(error){
    console.log("Error:", error);
    res.status(400).json({message: 'Error updating user', error });
  }
};

// Function to get user details
export const getUserDetails = async (req, res) => {
  console.log(`CONSOLE: Entered getUserDetails function`);
  try{
    const id = req.params.userID;
    const user = await User.findById(id);
    if(!user){
      return res.status(401).json({message: 'User not found' });
    }
    res.status(200).json(user);
  }catch(error){
    res.status(400).json({message: 'Error fetching user details', error });
  }
};

/////////////////////////

// Function to delete a user
export const deleteUser = async (req, res) => {
  console.log(`CONSOLE: Entered deleteUser function`);
  try {
    const id = req.params.userID;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully', deletedUser: user });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting user', error });
  }
};

// Function to get all users
export const listUsers = async (req, res) => {
  console.log(`CONSOLE: Entered getAllUsers function`);
  try {
    const { page = 1, limit = 10 } = req.query;
    const users = await User.find()
                             .skip((page - 1) * limit)
                             .limit(limit);
    
    // Get the count of users for each role
    const roleCounts = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    console.log("Role Counts:", roleCounts);

    // Get the total count of users
    const totalUsers = await User.countDocuments();
    console.log("Total Users:", totalUsers);

    res.status(200).json({
      users,
      roleCounts,
      totalUsers
    });
  } catch (error) {
    res.status(400).json({ message: 'Error listing users', error });
  }
};

// Function to search for users
export const searchUsers = async (req, res) => {
  console.log(`CONSOLE: Entered searchUsers function`);
  try {
    const { name, email } = req.query;
    
    // First, try to find a user that matches both criteria.
    if (name && email) {
      const queryBoth = {
        name: new RegExp(name, 'i'),
        email: new RegExp(email, 'i')
      };
      const userBoth = await User.findOne(queryBoth);
      if (userBoth) {
        return res.status(200).json({
          message: 'User found with both criteria',
          user: userBoth
        });
      } else {
        res.status(404).json({
          message: 'No users found with both criteria'
        });
      }
    }

    // If not found, search individually.
    const responseObject = { message: 'User(s) found with individual criteria', users: {} };

    if (name) {
      const usersByName = await User.find({ name: new RegExp(name, 'i') });
      if (usersByName.length > 0) {
        responseObject.users.usersByName = usersByName;
      }
    }

    if (email) {
      const usersByEmail = await User.find({ email: new RegExp(email, 'i') });
      if (usersByEmail.length > 0) {
        responseObject.users.usersByEmail = usersByEmail;
      }
    }

    // If no users found individually, change the message
    if (Object.keys(responseObject.users).length === 0) {
      responseObject.message = 'No users found with either criteria';
    }

    res.status(200).json(responseObject);

  } catch (error) {
    res.status(400).json({ message: 'Error searching users', error });
  }
};


// Function to change password
// Request Parameters: currentPassword and newPassword.
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;  // Assuming you have user info in req.user

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password and update user document
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error updating password', error });
  }
};

// Function for forgot password
// Request Parameters: email.
export const forgotPassword = async (req, res) => {
  console.log("API Key:", process.env.SENDINBLUE_API_KEY); 

  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a reset token and save it to the user document
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpiration = Date.now() + 3600000;  // 1 hour
    await user.save();

    // Send email containing reset token using Mailgun
    sendEmail(
        user.email, 
        'Password Reset', 
        `You requested a password reset. Click this link to set a new password: http://order-taker.dgalanopoulos.eu/reset-password/${resetToken}`
    );

  } catch (error) {
    console.log("Caught an error:", error);
    res.status(400).json({ message: 'Error in forgot password', error });
  }
};

// Function for verifying email
// Request Parameters: token.
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Find the user by the email verification token and check token expiration
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationTokenExpiration: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    // Update the user's email verification status
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpiration = undefined;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error verifying email', error });
  }
};

// Function to lock the account
export const lockAccount = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.accountStatus = 'Locked';

    await user.save();
    res.status(200).json({ message: 'Account locked successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error locking account', error });
  }
};

// Function to activate the account
export const activateAccount = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.accountStatus = 'Active';

    await user.save();
    res.status(200).json({ message: 'Account activated successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error activating account', error });
  }
};

// Function to deactivate the account
export const deactivateAccount = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.accountStatus = 'Deactivated';

    await user.save();
    res.status(200).json({ message: 'Account deactivated successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deactivating account', error });
  }
};



// Function to refresh token
// Request Parameters: token.
export const refreshToken = async (req, res) => {
  try {
    const currentToken = req.body.token;

    // Verify the existing token
    jwt.verify(currentToken, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid token' });
      }

      // Create a new token
      const newToken = jwt.sign(
        { id: decoded.id }, 
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.status(200).json({
        token: newToken
      });
    });
  } catch (error) {
    res.status(400).json({ message: 'Error refreshing token', error });
  }
};

/////////////////////////
