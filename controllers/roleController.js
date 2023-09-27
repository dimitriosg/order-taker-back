// controllers/roleController.js

import Role from '../models/Role.js';

export const getAllRoles = async (req, res) => {
    try {
        const roles = await Role.find();
        res.json(roles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
