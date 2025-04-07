const fileUtils = require('../utils/fileUtils');
const telegramService = require('../services/telegramService');

class OrderController {
    // Create new order
    async createOrder(req, res) {
        try {
            const { items, total, user } = req.body;
            console.log(user)
            // Validate request data
            if (!items || !Array.isArray(items) || items.length === 0) {
                console.error("❌ Order error: Invalid items list");
                return res.status(400).json({ 
                    success: false, 
                    message: "Mahsulotlar ro'yxati noto'g'ri" 
                });
            }
            
            if (typeof total !== 'number' || total <= 0) {
                console.error("❌ Order error: Invalid total");
                return res.status(400).json({ 
                    success: false, 
                    message: "Narx noto'g'ri" 
                });
            }
            
            // Create new order object
            const newOrder = {
                id: 'ORD-' + Date.now(),
                items,
                total,
                user,
                status: 'new',
                createdAt: new Date().toISOString()
            };
            
            // Save order
            const orders = fileUtils.readOrders();
            orders.push(newOrder);
            const saveSuccess = fileUtils.saveOrders(orders);
            
            if (!saveSuccess) {
                throw new Error("Buyurtmani saqlashda xatolik");
            }
            
            console.log(`✅ New order received: ${newOrder.id}`);
            
            console.log('sss ____________-')
            // Send Telegram notification
            const test11 = await telegramService.sendOrderNotification(newOrder);
            console.log(test11, ' ____________-')
            return res.json({
                success: true, 
                orderId: newOrder.id,
                message: 'Buyurtmangiz muvaffaqiyatli qabul qilindi'
            });
        } catch (error) {
            console.error("❌ Order error:", error.message);
            return res.status(500).json({ 
                success: false, 
                message: "Buyurtmani qayta ishlashda xatolik yuz berdi. Iltimos qayta urinib ko'ring." 
            });
        }
    }

    // Get all orders (admin only)
    async getOrders(req, res) {
        try {
            const orders = fileUtils.readOrders();
            res.json(orders);
        } catch (error) {
            console.error("❌ Error fetching orders:", error);
            res.status(500).json({ 
                success: false, 
                message: "Failed to fetch orders" 
            });
        }
    }

    // Get order by ID (admin only)
    async getOrderById(req, res) {
        try {
            const { id } = req.params;
            const orders = fileUtils.readOrders();
            const order = orders.find(o => o.id === id);

            if (!order) {
                return res.status(404).json({ 
                    success: false, 
                    message: "Order not found" 
                });
            }

            res.json(order);
        } catch (error) {
            console.error("❌ Error fetching order:", error);
            res.status(500).json({ 
                success: false, 
                message: "Failed to fetch order" 
            });
        }
    }

    // Update order status (admin only)
    async updateOrderStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!status) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Status is required" 
                });
            }

            const orders = fileUtils.readOrders();
            const orderIndex = orders.findIndex(o => o.id === id);

            if (orderIndex === -1) {
                return res.status(404).json({ 
                    success: false, 
                    message: "Order not found" 
                });
            }

            orders[orderIndex].status = status;
            orders[orderIndex].updatedAt = new Date().toISOString();

            fileUtils.saveOrders(orders);

            console.log(`✏️ Order status updated: ${id} -> ${status}`);

            res.json({ 
                success: true, 
                message: "Order status updated successfully" 
            });
        } catch (error) {
            console.error("❌ Error updating order status:", error);
            res.status(500).json({ 
                success: false, 
                message: "Failed to update order status" 
            });
        }
    }
}

module.exports = new OrderController();