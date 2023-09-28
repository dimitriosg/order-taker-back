// controllers/roleController.js

import mongoose from 'mongoose';
import User from '../models/User.js';

export const getAllRoles = async (req, res) => {
    console.log(`CONSOLE: Entered getAllRoles function`);

    try {
        // Use the distinct method to get all unique roles from the User model
        const roles = await User.distinct('role');
        console.log('Roles:', roles);  // Log the roles

        if (!roles || roles.length === 0) {
            console.log('No roles found');
            return res.status(404).json({ message: 'No roles found' });
        }

        res.status(200).json(roles);
    } catch (error) {
        console.error('Error:', error);  // Log the error to the console
        res.status(500).json({ message: error.message });
    }
};

