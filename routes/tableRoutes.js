// backend/routes/tableRoutes.js
import express from 'express';
import Order from '../models/Order.js';
import Table from '../models/Table.js';

const router = express.Router();

// Fetching all tables
router.get('/', async (req, res) => {
    try {
        const tables = await Table.find({});
        res.status(200).json(tables);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch tables", error: error.message });
    }
});

// Table statistics
router.get('/stats', async (req, res) => {
    try {
        const totalTables = await Table.countDocuments({});
        const freeTables = await Table.countDocuments({ status: 'FREE' });
        const busyTables = await Table.countDocuments({ status: 'BUSY' });
        const reservedTables = await Table.countDocuments({ status: 'RESERVED' });
        
        res.json({
            totalTables,
            freeTables,
            busyTables,
            reservedTables
        });

    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch table stats", error: error.message });
    }
});

// Fetching all orders for a specific table
router.get('/:tableId', async (req, res) => {
    try {
        const orders = await Order.find({ table: req.params.tableId });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});

// Creating a new order for a specific table
router.post('/:tableId', async (req, res) => {
    try {
        const newOrder = new Order({
            table: req.params.tableId,
            items: req.body.items,
        });
        const savedOrder = await newOrder.save();
        res.json(savedOrder);
    } catch (error) {
        res.status(400).json({ message: 'Bad Request', error });
    }
});

// Updating the status of a specific table
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const table = await Table.findById(req.params.id);
        table.status = status;
        await table.save();
        res.json({ success: true, table });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create new tables
router.post('/create', async (req, res) => {
    try {
        const { numberOfTables } = req.body;
        const tables = [];
        const highestTableNumber = (await Table.find().sort({number: -1}).limit(1))[0]?.number || 0;

        for (let i = 1; i <= numberOfTables; i++) {
            tables.push({
                number: highestTableNumber + i,
            });
        }

        const createdTables = await Table.insertMany(tables);
        res.json({ success: true, message: `${createdTables.length} tables created!` });

    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to create tables", error: error.message });
    }
});

// Delete multiple tables
router.delete('/remove/:numberOfTables', async (req, res) => {
    try {
        const { numberOfTables } = req.params;
        const tablesToDelete = await Table.find().sort({ number: -1 }).limit(numberOfTables);

        const tableIdsToDelete = tablesToDelete.map(table => table._id);
        await Table.deleteMany({ _id: { $in: tableIdsToDelete } });

        res.json({ success: true, message: `${numberOfTables} tables removed!` });

    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to remove tables", error: error.message });
    }
});

export default router;
