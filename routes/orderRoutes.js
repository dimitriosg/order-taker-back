// backend/routes/orderRoutes.js

import express from 'express';
import Table from '../models/Table.js';
import Order from '../models/Order.js';

const router = express.Router();

// Get Tables for a Specific Waiter
router.get('/tables/:waiterId', async (req, res) => {
    try {
        const tables = await Table.find({ waiter: req.params.waiterId });
        res.json(tables);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});

// Get Orders for a Specific Waiter
router.get('/user/:userId', async (req, res) => {
    try {
        const orders = await Order.find({ waiterID: req.params.userId });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders.', error });
    }
});

export default router;
