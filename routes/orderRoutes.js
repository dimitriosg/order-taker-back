// backend/routes/orderRoutes.js
import express from 'express';
import Table from '../models/Table.js';
import Order from '../models/Order.js';
import OrderCounter from '../models/OrderCounter.js';

const router = express.Router();

// Helper function to generate unique order number
const generateOrderNumber = (tableNumber, increment, isReserved) => {
    const year = new Date().getFullYear().toString().substr(-2);
    const reservedPrefix = isReserved ? 'YR' : 'NR';
    const formattedTableNumber = String(tableNumber).padStart(3, '0');
    const formattedIncrement = String(increment).padStart(5, '0');
    return `O${year}-${reservedPrefix}-${formattedTableNumber}-${formattedIncrement}`;
};
///////////////////////////////////////////////////////

// Generate order number for a new order
router.get('/generateOrderNumber', async (req, res) => {
    try {
        const tableNumber = parseInt(req.query.tableNumber);
        const isReserved = req.query.isReserved === 'true';

        // Atomically increment the counter and fetch the new value
        const counter = await OrderCounter.findByIdAndUpdate(
            { _id: 'orderIncrement' }, 
            { $inc: { lastIncrement: 1 } }, 
            { new: true, upsert: true }
        );

        const nextIncrementValue = counter.lastIncrement;

        // Generate the order number
        const orderNumber = generateOrderNumber(tableNumber, nextIncrementValue, isReserved);
        res.status(200).json(orderNumber);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error generating order number', error });
    }
});


// Create an order
router.post('/table/:tableId', async (req, res) => {
    console.log("Incoming Order Data:", req.body); // Log incoming request
    try {
        const { items, waiterID, orderID } = req.body; // Include orderID in the destructuring
        const table = await Table.findById(req.params.tableId);
        if (!table) return res.status(404).json({ message: 'Table not found' });

        const totalAmount = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

        const newOrder = new Order({
            orderID, // Use the provided orderID
            tableId: table._id,
            waiterID,
            items,
            totalAmount,
            status: 'created',
            statusLog: [{ 
                status: 'created', 
                changedBy: waiterID, 
                changedAt: new Date() 
            }]
        });

        const savedOrder = await newOrder.save();
        res.status(201).json(savedOrder);
    } catch (error) {
        console.error('Error details:', error); 
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation Error', details: error.message });
        }

        console.error('Error details:', error); // Log the entire error object
        res.status(500).json({ message: 'Error creating order', error: error.message });
    }
});


// Update an order
router.patch('/update/:orderId', async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.orderId);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.status = status;
        order.statusLog.push({ 
            status: status, 
            changedBy: req.user._id, 
            changedAt: new Date() 
        });

        const updatedOrder = await order.save();

        res.status(200).json(updatedOrder);
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ message: 'Error updating order', error: error.message });
    }
});

// Cancel an order -=-=-= NOT RECOMMENDED =-=-=-=-
router.delete('/cancel/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        // Update the order status to 'cancelled' and append to status log
        order.status = 'cancelled';
        order.statusLog.push({ status: 'cancelled', changedBy: req.user._id, changedAt: new Date() });

        const updatedOrder = await order.save();
        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: 'Error cancelling order', error: error.message });
    }
});
/////////////////////////////////////////////////////

// Get all orders from all tables
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find();
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
})

// Get all orders from a specific table
router.get('/fromTable/:tableId', async (req, res) => {
    try {
        const orders = await Order.find({ tableId: req.params.tableId });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
})

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
