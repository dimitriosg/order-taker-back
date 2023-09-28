// models/Role.js

import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
    role: {
        type: String,
        required: true,
        unique: true,
    },
    // ...other fields
});

const Role = mongoose.model('Role', roleSchema);

export default Role;
