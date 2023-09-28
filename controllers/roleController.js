// controllers/roleController.js

import mongoose from 'mongoose';
import Role from '../models/Role.js';

export const getAllRoles = async (req, res) => {
    console.log(`CONSOLE: Entered getAllRoles function`);
    try {
        const roles = await Role.find();

        // Get the count of users for each role
        const userCounts = await User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);
        console.log("User Counts:", userCounts);

        // Optionally, get the total count of roles
        const totalRoles = await Role.countDocuments();
        console.log("Total Roles:", totalRoles);

        res.status(200).json({
            roles,
            userCounts,
            totalRoles
        });
    } catch (error) {
        console.error(error);  // Log the error to the console
        res.status(500).json({ message: error.message });
    }
};

