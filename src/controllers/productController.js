const fileUtils = require('../utils/fileUtils');
const imageUtils = require('../utils/imageUtils');
const telegramService = require('../services/telegramService');

class ProductController {
    // Get all products
    async getProducts(req, res) {
        try {
            const menuItems = fileUtils.readMenuItems();
            res.json(menuItems);
        } catch (error) {
            console.error('❌ Error fetching products:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch products'
            });
        }
    }

    // Add new product
    async addProduct(req, res) {
        try {
            const { name, description, price } = req.body;
            const imageFile = req.file;

            if (!name || !description || !price) {
                return res.status(400).json({
                    success: false,
                    message: "Name, description and price are required"
                });
            }

            let imageUrl = imageUtils.getDefaultImageUrl();

            if (imageFile) {
                try {
                    // Validate image
                    imageUtils.validateImage(imageFile);

                    // Upload image to Telegram
                    const imageResult = await telegramService.uploadImage(
                        imageFile.buffer,
                        imageFile.originalname
                    );
                    imageUrl = imageResult.url;

                } catch (imageError) {
                    console.error("⚠️ Image upload failed, using default image:", imageError);
                }
            }

            const menuItems = fileUtils.readMenuItems();
            const newId = fileUtils.getNextId(menuItems);

            const newProduct = {
                id: newId,
                name,
                description,
                price: parseFloat(price),
                image: imageUrl
            };

            menuItems.push(newProduct);
            fileUtils.saveMenuItems(menuItems);

            console.log(`✅ Product added: ${newProduct.name} (${newProduct.id})`);

            return res.json({
                success: true,
                message: "Product added successfully",
                product: newProduct
            });

        } catch (error) {
            console.error("❌ Error saving product:", error);
            return res.status(500).json({
                success: false,
                message: error.message || "Error saving product"
            });
        }
    }

    // Update product
    async updateProduct(req, res) {
        try {
            const { id } = req.params;
            const { name, description, price } = req.body;
            const imageFile = req.file;
            const existingImageUrl = req.body.imageUrl;

            if (!name || !description || !price) {
                return res.status(400).json({
                    success: false,
                    message: "Name, description and price are required"
                });
            }

            const menuItems = fileUtils.readMenuItems();
            const productId = parseInt(id);
            const productIndex = menuItems.findIndex(item => item.id === productId);

            if (productIndex === -1) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found"
                });
            }

            let finalImageUrl = existingImageUrl;

            if (imageFile) {
                try {
                    // Validate new image
                    imageUtils.validateImage(imageFile);

                    // Upload new image to Telegram
                    const imageResult = await telegramService.uploadImage(
                        imageFile.buffer,
                        imageFile.originalname
                    );
                    finalImageUrl = imageResult.url;

                } catch (imageError) {
                    console.error("⚠️ Image upload failed, keeping existing image:", imageError);
                    // Keep existing image URL if upload fails
                    finalImageUrl = menuItems[productIndex].image;
                }
            }

            // Validate final image URL
            if (!finalImageUrl || !(await imageUtils.isValidImageUrl(finalImageUrl))) {
                finalImageUrl = imageUtils.getDefaultImageUrl();
            }

            const updatedProduct = {
                id: productId,
                name,
                description,
                price: parseFloat(price),
                image: finalImageUrl
            };

            menuItems[productIndex] = updatedProduct;
            fileUtils.saveMenuItems(menuItems);

            console.log(`✏️ Product updated: ${updatedProduct.name} (ID: ${productId})`);

            res.json({
                success: true,
                message: "Product updated successfully",
                product: updatedProduct
            });
        } catch (error) {
            console.error("❌ Error updating product:", error);
            return res.status(500).json({
                success: false,
                message: error.message || "Error updating product"
            });
        }
    }

    // Delete product
    async deleteProduct(req, res) {
        try {
            const { id } = req.params;
            const productId = parseInt(id);

            const menuItems = fileUtils.readMenuItems();
            const productIndex = menuItems.findIndex(item => item.id === productId);

            if (productIndex === -1) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found"
                });
            }

            const deletedProduct = menuItems[productIndex];
            const updatedMenuItems = menuItems.filter(item => item.id !== productId);
            fileUtils.saveMenuItems(updatedMenuItems);

            console.log(`🗑️ Product deleted: ${deletedProduct.name} (ID: ${productId})`);

            res.json({
                success: true,
                message: "Product deleted successfully"
            });
        } catch (error) {
            console.error("❌ Error deleting product:", error);
            return res.status(500).json({
                success: false,
                message: "Error deleting product"
            });
        }
    }
}

module.exports = new ProductController();