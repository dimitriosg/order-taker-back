// models/Table.js
import mongoose from 'mongoose';

const tableSchema = new mongoose.Schema({
    number: { type: Number, required: true, unique: true },
    waiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const Table = mongoose.model('Table', tableSchema);

export default Table;
