const fs = require('fs');
const config = require('../config');

// Ensure data directory and files exist
const initializeDataFiles = () => {
    if (!fs.existsSync(config.DATA_DIR)) {
        fs.mkdirSync(config.DATA_DIR, { recursive: true });
    }

    const files = [
        { path: config.MENU_FILE, label: "menu.json" },
        { path: config.ORDERS_FILE, label: "orders.json" },
        { path: config.UPLOADS_FILE, label: "uploads.json" }
    ];

    files.forEach(file => {
        if (!fs.existsSync(file.path)) {
            fs.writeFileSync(file.path, JSON.stringify([], null, 2));
            console.log(`📄 ${file.label} created successfully`);
        }
    });
};

// Read JSON file
const readJsonFile = (filePath) => {
    try {
        return JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch (error) {
        console.error(`❌ Error reading file ${filePath}:`, error);
        return [];
    }
};

// Write JSON file
const writeJsonFile = (filePath, data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`❌ Error writing file ${filePath}:`, error);
        return false;
    }
};

// Simplified file operations
const readMenuItems = () => readJsonFile(config.MENU_FILE);
const saveMenuItems = (items) => writeJsonFile(config.MENU_FILE, items);
const readOrders = () => readJsonFile(config.ORDERS_FILE);
const saveOrders = (orders) => writeJsonFile(config.ORDERS_FILE, orders);
const readUploads = () => readJsonFile(config.UPLOADS_FILE);
const saveUploads = (uploads) => writeJsonFile(config.UPLOADS_FILE, uploads);

// Get next ID for items
const getNextId = (items) => {
    if (items.length === 0) return 1;
    return Math.max(...items.map(item => item.id)) + 1;
};

module.exports = {
    initializeDataFiles,
    readMenuItems,
    saveMenuItems,
    readOrders,
    saveOrders,
    readUploads,
    saveUploads,
    getNextId
};