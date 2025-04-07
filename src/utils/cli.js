const fs = require('fs').promises;
const path = require('path');
const config = require('../config');
const fileUtils = require('./fileUtils');

// CLI commands
const commands = {
    // Backup data
    async backup() {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupDir = path.join(config.DATA_DIR, 'backups', timestamp);
            
            await fs.mkdir(backupDir, { recursive: true });
            
            // Backup each data file
            const files = ['menu.json', 'orders.json', 'uploads.json'];
            for (const file of files) {
                const sourcePath = path.join(config.DATA_DIR, file);
                const destPath = path.join(backupDir, file);
                
                const data = await fs.readFile(sourcePath, 'utf8');
                await fs.writeFile(destPath, data);
                console.log(`✅ Backed up ${file}`);
            }
            
            console.log(`\n🎉 Backup completed: ${backupDir}`);
        } catch (error) {
            console.error('❌ Backup failed:', error);
        }
    },

    // Restore data from backup
    async restore(backupDir) {
        try {
            if (!backupDir) {
                const backupsPath = path.join(config.DATA_DIR, 'backups');
                const backups = await fs.readdir(backupsPath);
                if (backups.length === 0) {
                    throw new Error('No backups found');
                }
                // Get latest backup
                backupDir = path.join(backupsPath, backups[backups.length - 1]);
            }

            const files = ['menu.json', 'orders.json', 'uploads.json'];
            for (const file of files) {
                const sourcePath = path.join(backupDir, file);
                const destPath = path.join(config.DATA_DIR, file);
                
                const data = await fs.readFile(sourcePath, 'utf8');
                await fs.writeFile(destPath, data);
                console.log(`✅ Restored ${file}`);
            }
            
            console.log(`\n🎉 Restore completed from: ${backupDir}`);
        } catch (error) {
            console.error('❌ Restore failed:', error);
        }
    },

    // Clean old data and invalid entries
    async clean() {
        try {
            let cleaned = 0;
            
            // Clean menu items
            const menuItems = fileUtils.readMenuItems();
            const validMenuItems = menuItems.filter(item => {
                const isValid = item && item.id && item.name && item.price >= 0;
                if (!isValid) cleaned++;
                return isValid;
            });
            fileUtils.saveMenuItems(validMenuItems);
            
            // Clean orders
            const orders = fileUtils.readOrders();
            const validOrders = orders.filter(order => {
                const isValid = order && order.id && Array.isArray(order.items) && order.total >= 0;
                if (!isValid) cleaned++;
                return isValid;
            });
            fileUtils.saveOrders(validOrders);
            
            // Clean uploads
            const uploads = fileUtils.readUploads();
            const validUploads = uploads.filter(upload => {
                const isValid = upload && upload.id && upload.url && upload.fileId;
                if (!isValid) cleaned++;
                return isValid;
            });
            fileUtils.saveUploads(validUploads);
            
            console.log(`\n🧹 Cleaned ${cleaned} invalid entries`);
        } catch (error) {
            console.error('❌ Clean operation failed:', error);
        }
    },

    // Check data integrity
    async check() {
        try {
            const issues = [];
            
            // Check menu items
            const menuItems = fileUtils.readMenuItems();
            menuItems.forEach((item, index) => {
                if (!item.id) issues.push(`Menu item at index ${index} has no ID`);
                if (!item.name) issues.push(`Menu item ${item.id} has no name`);
                if (!item.price && item.price !== 0) issues.push(`Menu item ${item.id} has invalid price`);
            });
            
            // Check orders
            const orders = fileUtils.readOrders();
            orders.forEach((order, index) => {
                if (!order.id) issues.push(`Order at index ${index} has no ID`);
                if (!Array.isArray(order.items)) issues.push(`Order ${order.id} has invalid items`);
                if (!order.total && order.total !== 0) issues.push(`Order ${order.id} has invalid total`);
            });
            
            // Check uploads
            const uploads = fileUtils.readUploads();
            uploads.forEach((upload, index) => {
                if (!upload.id) issues.push(`Upload at index ${index} has no ID`);
                if (!upload.url) issues.push(`Upload ${upload.id} has no URL`);
                if (!upload.fileId) issues.push(`Upload ${upload.id} has no file ID`);
            });
            
            if (issues.length > 0) {
                console.log('\n⚠️ Found the following issues:');
                issues.forEach(issue => console.log(`- ${issue}`));
            } else {
                console.log('\n✅ All data checks passed');
            }
        } catch (error) {
            console.error('❌ Check operation failed:', error);
        }
    },

    // Show help
    help() {
        console.log(`
🛠️  Available commands:
- backup              Create a backup of all data
- restore [dir]       Restore data from backup (uses latest if no dir specified)
- clean              Clean invalid data entries
- check              Check data integrity
- help               Show this help message
        `);
    }
};

// Parse and execute command
const [,, command, ...args] = process.argv;

if (command && commands[command]) {
    commands[command](...args);
} else {
    commands.help();
}

module.exports = commands;