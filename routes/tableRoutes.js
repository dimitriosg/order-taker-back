// backend/routes/tableRoutes.js
import express from 'express';
import mongoose from 'mongoose';
import { authMiddleware } from '../middleware/authMiddleware.js';
//import Order from '../models/Order.js';
import Table from '../models/Table.js';

const router = express.Router();

// Assuming you always reserve for the current day.
const getUTCDateFromTime = (timeStr) => {
    const currentUTCDate = new Date().toISOString().split('T')[0];
    return new Date(`${currentUTCDate}T${timeStr}:00Z`);
};

// Fetching all tables
router.get('/', async (req, res) => {
    try {
        const tables = await Table.find({});

        const totalTables = tables.length;
        const freeTables = tables.filter(t => t.status === 'free').length;
        const busyTables = tables.filter(t => t.status === 'busy').length;
        const reservedTables = tables.filter(t => t.status === 'reserved').length;

        res.status(200).json({
            tables,
            stats: {
                totalTables,
                freeTables,
                busyTables,
                reservedTables
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch tables", error: error.message });
    }
});

// Fetching ONLY FREE tables
router.get('/free', async (req, res) => {
    try {
        const freeTables = await Table.find({ status: 'free' });
        res.status(200).json(freeTables);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch free tables", error: error.message });
    }
});


// Create new tables
router.post('/create', async (req, res) => {
    console.log("Received request to create tables with body:", req.body);

    let { numberOfTables } = req.body;
    numberOfTables = Number(numberOfTables);

    console.log("Parsed numberOfTables:", numberOfTables);

    if (isNaN(numberOfTables)) {
        console.error("Error: numberOfTables is NaN");
        return res.status(400).json({ message: 'Bad Request - Cannot create tables', error: 'Invalid numberOfTables parameter' });
    }
    
    if (numberOfTables <= 0) {
        console.error("Error: numberOfTables is less than or equal to 0.");
        return res.status(400).json({ message: 'Bad Request - Cannot create tables', error: 'numberOfTables is less than or equal to 0' });
    }    

    try {
        if (numberOfTables === undefined || isNaN(numberOfTables) || numberOfTables <= 0) {
            console.error("Error: Invalid numberOfTables parameter received.");
            return res.status(400).json({ message: 'Bad Request - Cannot create tables', error: 'Invalid numberOfTables parameter' });
        }

        // Get the last table number to determine the starting table number for new tables
        const lastTable = await Table.findOne().sort({ tableNumber: -1 });
        const startingTableNumber = lastTable ? lastTable.tableNumber + 1 : 1;

        const tablesToBeCreated = [];
        for (let i = 0; i < numberOfTables; i++) {
            tablesToBeCreated.push({ tableNumber: startingTableNumber + i });
        }

        console.log("Attempting to create tables with numbers:", tablesToBeCreated.map(t => t.tableNumber));

        await Table.insertMany(tablesToBeCreated);

        res.status(201).json({ message: `${numberOfTables} tables added successfully` });
    } catch (error) {
        console.error("Error while attempting to add tables:", error);
        res.status(400).json({ message: 'Could not add tables', error });
    }
});


// Delete multiple tables
router.delete('/delete/:tablesToDelete', async (req, res) => {
    try {
        const tablesToDelete = parseInt(req.params.tablesToDelete, 10);
        
        if (isNaN(tablesToDelete) || tablesToDelete <= 0) {
            return res.status(400).json({ message: 'Invalid number of tables to delete' });
        }

        // Fetch the last n tables
        const tables = await Table.find({})
                                  .sort({ tableNumber: -1 })
                                  .limit(tablesToDelete)
                                  .select('_id');

        // Extract table IDs and delete them
        const tableIdsToDelete = tables.map(table => table._id);
        await Table.deleteMany({ _id: { $in: tableIdsToDelete } });

        res.status(200).json({ message: `${tablesToDelete} tables removed successfully` });
    } catch (error) {
        res.status(400).json({ message: 'Could not remove tables', error });
    }
});

// Reserve a table
router.post('/reserve', async (req, res) => {
    const { name, phone, tableId, reservedAt, holdingTime } = req.body;
    try {
        const tableToReserve = await Table.findById(tableId);
        
        if (!tableToReserve || tableToReserve.status !== 'free') {
            return res.status(400).json({ message: 'Table is not available for reservation.' });
        }

        tableToReserve.status = 'reserved';

        const reservedTime = reservedAt;
        const releaseTimeHours = parseInt(reservedAt.split(":")[0]) + Math.floor(holdingTime / 60);
        const releaseTimeMinutes = (parseInt(reservedAt.split(":")[1]) + holdingTime % 60) % 60;
        const releaseAtTime = `${String(releaseTimeHours).padStart(2, '0')}:${String(releaseTimeMinutes).padStart(2, '0')}`;

        tableToReserve.reservation = {
            name,
            phone,
            reservedAt: reservedTime,
            releaseAt: releaseAtTime
        };

        const savedTable = await tableToReserve.save();

        if (!savedTable) {
            throw new Error("Failed to save table reservation details.");
        }

        res.status(200).json({ message: 'Table reserved successfully.' });
    } catch (error) {
        console.error("Error while reserving table:", error);
        res.status(500).json({ message: 'Failed to reserve table', error: error.message });
    }
});


// Fetch all reserved tables
router.get('/reserved', async (req, res) => {
    try {
        const reservedTables = await Table.find({ status: 'reserved' });
        res.status(200).json(reservedTables);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch reserved tables", error: error.message });
    }
});

// Modify reservation
router.put('/modify-reservation/:tableId', async (req, res) => {
    const { tableId } = req.params;
    const { name, phone, reservedAt, holdingTime } = req.body;

    try {
        const table = await Table.findById(tableId);

        if (!table || table.status !== 'reserved') {
            return res.status(404).json({ message: 'Table not found or not reserved.' });
        }

        // Since reservedAt and releaseAt are now just time strings, there's no need to adjust for time zones or calculate the release time.
        table.reservation = {
            name,
            phone,
            reservedAt,
            releaseAt: holdingTime  // renaming this to be more intuitive
        };

        await table.save();
        res.status(200).json({ message: 'Reservation updated successfully.' });
    } catch (error) {
        console.error("Error while updating reservation:", error);
        res.status(500).json({ message: 'Failed to update reservation', error: error.message });
    }
});

// Delete reservation
router.put('/cancel-reservation/:tableId', async (req, res) => {
    const { tableId } = req.params;

    try {
        const table = await Table.findByIdAndUpdate(tableId, {
            status: 'free',
            name: null,
            phone: null,
            time: null,
            holdingTime: null
        }, { new: true });

        if (!table) {
            return res.status(404).json({ message: "Table not found" });
        }

        res.status(200).json(table);
    } catch (error) {
        res.status(500).json({ message: "Failed to cancel reservation", error: error.message });
    }
});

// Fetching all orders for a specific table
router.get('/:tableId/orders', async (req, res) => {
    try {
        const orders = await Order.find({ table: req.params.tableId });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
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
///////////////////////////////////

// Modifying Table Details (e.g., assigning a waiter or changing status):
router.post('/modify/:tableId', async (req, res) => {
    try {
        const newOrder = new Order({
            table: req.params.tableId,
            items: req.body.items,
        });
        const savedOrder = await newOrder.save();
        res.json(savedOrder);
    } catch (error) {
        res.status(400).json({ message: 'Bad Request - cannot create order', error });
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



export default router;
