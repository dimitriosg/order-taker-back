// controllers/roleController.js

import Role from '../models/Role.js';

export const getAllRoles = async (req, res) => {
    console.log(`CONSOLE: Entered getAllRoles function`);

    try {
        // Get the count of users for each role
        const roles = await Role.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);
        console.log("Role Counts:", userCounts);

        // Optionally, get teht total of count of roles
        const totalRoles = await Role.countDocuments();

        res.status(200).json({
            roles,
            totalRoles
        });
    }catch (error) {
        res.status(400).json({ message: 'Error listing roles', error });
    }
};
