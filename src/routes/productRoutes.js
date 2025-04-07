const express = require('express');
const multer = require('multer');
const { checkAdmin } = require('../middlewares/auth');
const productController = require('../controllers/productController');
const config = require('../config');

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: config.MAX_FILE_SIZE // 5MB limit
    }
});

// Public routes
router.get('/menu', productController.getProducts);

// Admin routes
router.post('/admin/products', checkAdmin, upload.single('image'), productController.addProduct);
router.put('/admin/products/:id', checkAdmin, upload.single('image'), productController.updateProduct);
router.delete('/admin/products/:id', checkAdmin, productController.deleteProduct);

module.exports = router;