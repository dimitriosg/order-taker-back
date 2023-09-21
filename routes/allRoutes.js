// allRoutes.js is the main router file that contains all the routes of the application.
import express from 'express';
import * as userController from '../controllers/userController.js';
import * as orderController from '../controllers/orderController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import * as funcSOS from '../utils/funcSOS.js';
import { checkRole } from '../middleware/checkRole.js';
import * as adminExc from '../utils/adminExc.js';
import * as accountController from '../controllers/accountLinking.controller.js';
import * as invitationController from '../controllers/invitations.controller.js';

const router = express.Router();

// User Routes
router.post('/api/users/create', userController.createUser);
router.post('/api/users/authenticate', userController.authenticateUser);
router.put('/api/users/update/:userID', userController.updateUser);
router.get('/api/users/details/:userID', userController.getUserDetails);
router.get('/api/users/list', userController.listUsers);
router.delete('/api/users/delete/:userID', userController.deleteUser);
router.get('/api/users/search', userController.searchUsers);

router.put('/api/users/change-password', authMiddleware, userController.changePassword);
router.post('/api/users/forgot-password', userController.forgotPassword);

router.get('/api/users/verify-email/:token', userController.verifyEmail);
router.post('/api/users/refresh-token', userController.refreshToken);

router.post('/api/users/lock', userController.lockAccount);
router.post('/api/users/activate', userController.activateAccount);
router.post('/api/users/deactivate', userController.deactivateAccount);


// Order Routes
router.post('/api/orders/create', orderController.createOrder);
router.put('/api/orders/modify/:orderID', orderController.modifyOrder);
router.put('/api/orders/update-status/:orderID', orderController.updateOrderStatus);


// Test Endpoint
router.post('/api/debug', (req, res) => {
    console.log("Debug Endpoint: ", req.body);
    res.json(req.body);
});
/////////////////////////
// >>>> LINKING & INVITATION routes <<<<
// ACCOUNT LINKING ROUTES
router.post('/api/link-account', accountController.linkAccount);
router.post('/api/unlink-account', accountController.unlinkAccount);

// INVITATION ROUTES
router.post('/api/invite', authMiddleware, invitationController.inviteUser);
/////////////////////////
// ADMIN EXCLUSIVE ROUTES
// Counters per role <<< ADMIN RIGHTS >>>
router.get('/api/adm/getAllWaiters', checkRole(['admin', 'developer']), adminExc.getAllWaiters);
router.get('/api/adm/getallCashiers', checkRole(['admin', 'developer']), adminExc.getAllCashiers);
router.get('/api/adm/getAllAccountants', checkRole(['admin', 'developer']), adminExc.getAllAccountants);
router.get('/api/adm/getAllAdmins', checkRole(['admin', 'developer']), adminExc.getAllAdmins);

// Role functions <<< ADMIN RIGHTS >>>
router.put('/api/adm/assignRole', authMiddleware, checkRole(['admin', 'developer']), adminExc.assignRole);
router.get('/api/adm/getActivityHistory/:userId', authMiddleware, checkRole(['admin', 'developer']), adminExc.getActivityHistory);

/////////////////////////
// DEVELOPER EXCLUSIVE ROUTES
// DANGER ZONE >>> DEVELOPER RIGHTS <<<
console.log(funcSOS.deleteAllUsers);
router.put('/api/dev/oloiko-katharisma-xriston', authMiddleware, checkRole(['developer']), funcSOS.deleteAllUsers);

export default router;
