const path = require('path');
require('dotenv').config();

module.exports = {
    PORT: process.env.PORT || 3000,
    BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    ADMIN_CHAT_ID: process.env.ADMIN_CHAT_ID,
    WEBAPP_URL: process.env.WEBAPP_URL || 'https://resort-elimination-standings-recommendation.trycloudflare.com',
    
    // Data paths
    DATA_DIR: path.join(__dirname, '../../data'),
    MENU_FILE: path.join(__dirname, '../../data/menu.json'),
    ORDERS_FILE: path.join(__dirname, '../../data/orders.json'),
    UPLOADS_FILE: path.join(__dirname, '../../data/uploads.json'),
    
    // Image upload limits
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    
    // Get admin IDs array
    getAdminIds: () => {
        return [process.env.ADMIN_CHAT_ID].filter(Boolean);
    }
};