// routes/tableRoutes.js
import express from 'express';
import Table from '../models/Table.js';

const router = express.Router();

router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const table = await Table.findById(req.params.id);
        
        // Logic to verify the user role and validate the status change.
        // For now, as a simple example, let's just update the status.
        table.status = status;

        await table.save();

        res.json({ success: true, table });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
