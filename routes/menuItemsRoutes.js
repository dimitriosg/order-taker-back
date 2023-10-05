import express from 'express';
import MenuItem from '../models/MenuItem.js';
import { authMiddleware } from '../middleware/authMiddleware.js'; // Assuming you have these middlewares set up.

const router = express.Router();

router.post('/addMenuItem', authMiddleware, async (req, res) => {
    try {
        const { name, price, description, category, imageUrl } = req.body;
        const newItem = new MenuItem({
            name,
            price,
            description,
            category,
            imageUrl
        });
        await newItem.save();
        res.status(201).json(newItem);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add the item.' });
    }
});

router.delete('/removeMenuItem/:itemId', authMiddleware, async (req, res) => {
    try {
        const { itemId } = req.params;
        const item = await MenuItem.findById(itemId);
        if (!item) {
            return res.status(404).json({ error: 'Item not found.' });
        }
        await item.remove();
        res.status(200).json({ message: 'Item removed successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to remove the item.' });
    }
});
