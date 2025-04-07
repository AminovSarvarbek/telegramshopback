const express = require('express');
const { checkUser, checkAdmin } = require('../middlewares/auth');
const orderController = require('../controllers/orderController');

const router = express.Router();

// Admin verification endpoint
router.post('/admin/verify', checkUser, (req, res) => {
    const adminIds = require('../config').getAdminIds();
    const isAdmin = adminIds.includes(String(req.user.id));
    
    res.json({
        success: true,
        isAdmin,
        message: isAdmin ? 'User is admin' : 'User is not admin'
    });
});

// User routes
router.post('/orders', orderController.createOrder);

// Admin routes
router.get('/admin/orders', checkAdmin, orderController.getOrders);
router.get('/admin/orders/:id', checkAdmin, orderController.getOrderById);
router.put('/admin/orders/:id/status', checkAdmin, orderController.updateOrderStatus);

module.exports = router;