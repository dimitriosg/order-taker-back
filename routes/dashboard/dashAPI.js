// File: /backend/routes/dashboard/dashAPI.js

import express from 'express';
import dashboardController from '../../controllers/dashboard.controller.js';

const router = express.Router();

// Route for fetching dashboard data
router.get('/data', dashboardController.fetchDashboardData);

// Route for fetching cashier details
router.get('/cashier/details', dashboardController.cashier.fetchCashierDetails);

// Route for updating cash holding
router.post('/cashier/update-cash-holding', dashboardController.cashier.updateCashHolding);

// Route for notifying the accountant
router.post('/cashier/notify-accountant', dashboardController.cashier.notifyAccountant);

export default router;
