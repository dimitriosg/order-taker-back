// models/Table.js
import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema({
    name: {
        type: String,
        default: null
    },
    phone: {
        type: String,
        default: null
    },
    reservedAt: {
        type: String,  // Changed from Date to String
        default: null
    },
    releaseAt: {
        type: String,  // Changed from Date to String
        default: null
    }
});

const tableSchema = new mongoose.Schema({
    tableNumber: {
        type: Number,
        required: true,
        unique: true,
    },
    status: {
        type: String,
        enum: ['free', 'busy', 'reserved'],
        default: 'free'
    },
    waiterEmail: {
        type: String,
        default: null
    },
    reservation: {
        type: reservationSchema,
        default: {}
    }
});

const Table = mongoose.model('Table', tableSchema);

export default Table;
