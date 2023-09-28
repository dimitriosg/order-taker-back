// controllers/roleController.js

import mongoose from 'mongoose';
import User from '../models/User.js';
import Role from '../models/Role.js';

export const getAllRoles = async (req, res) => {
    console.log(`CONSOLE: Entered getAllRoles function`);
    try {
        const roles = await Role.find();
        const roleNames = roles.map(role => role.name);  // Extract the name of each role

        res.status(200).json(roleNames);
    } catch (error) {
        console.error(error);  // Log the error to the console
        res.status(500).json({ message: error.message });
    }
};

