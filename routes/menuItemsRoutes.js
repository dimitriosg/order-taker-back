// src/routes/menuItemsRoutes.js
import express from 'express';
import MenuItem from '../models/MenuItem.js';
import { upload } from '../middleware/multer.js';
import { authMiddleware } from '../middleware/authMiddleware.js'; // Assuming you have these middlewares set up.

const router = express.Router();

router.post('/addMenuItem', upload.single('image'), async (req, res) => {
    console.log(req.body);  // Should show your text fields
    console.log(req.file);  // Should show info about the uploaded file

    try {
        // const { name, price, description, category } = req.body;
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

        const newItem = new MenuItem({
            name: req.body.name,
            price: req.body.price,
            description: req.body.description,
            category: req.body.category,
            imageUrl,
        });
        await newItem.save();
        res.status(201).json({ 
            success: true, 
            message: 'Menu item added successfully!', 
            data: newItem 
        });
    } catch (error) {
        console.log(`Req.headers: ${JSON.stringify(req.headers)}`);
        console.log(`Req.headers['content-type']: ${req.headers['content-type']}`);
        console.error("Error while adding the item:", error); // Log the error for debugging
        res.status(500).json({ 
            success: false, 
            error: `Failed to add the item. Reason: ${error.message}.` 
        });
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

router.get('/', async (req, res) => {
    try {
        const items = await MenuItem.find();
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch menu items.' });
    }
});

export default router;