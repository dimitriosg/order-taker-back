// src/routes/menuItemsRoutes.js
import express from 'express';
import MenuItem from '../models/MenuItem.js';
import { upload } from '../middleware/multer.js';
import { authMiddleware } from '../middleware/authMiddleware.js'; // Assuming you have these middlewares set up.

const router = express.Router();

router.post('/addMenuItem', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        const { name, price, description, category } = req.body;
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

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
        console.log(`Req.headers: ${JSON.stringify(req.headers)}`);
        console.log(`Req.headers['content-type']: ${req.headers['content-type']}`);
        console.error("Error while adding the item:", error); // Log the error for debugging
        res.status(500).json({ error: `Failed to add the item. Reason: ${error.message}. Body: ${req.body}` });
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

export default router;