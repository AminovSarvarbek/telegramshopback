const fs = require('fs').promises;
const path = require('path');
const config = require('../config');

async function initializeWorkspace() {
    try {
        // Create main data directory
        await fs.mkdir(config.DATA_DIR, { recursive: true });
        console.log('✅ Created data directory');

        // Create backups directory
        const backupsDir = path.join(config.DATA_DIR, 'backups');
        await fs.mkdir(backupsDir, { recursive: true });
        console.log('✅ Created backups directory');

        // Initialize data files with empty arrays
        const files = [
            { path: config.MENU_FILE, name: 'menu.json' },
            { path: config.ORDERS_FILE, name: 'orders.json' },
            { path: config.UPLOADS_FILE, name: 'uploads.json' }
        ];

        for (const file of files) {
            try {
                await fs.access(file.path);
                console.log(`ℹ️ ${file.name} already exists`);
            } catch {
                await fs.writeFile(file.path, '[]');
                console.log(`✅ Created ${file.name}`);
            }
        }

        console.log('\n🎉 Workspace initialized successfully!');
        
    } catch (error) {
        console.error('❌ Error initializing workspace:', error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    initializeWorkspace();
}

module.exports = initializeWorkspace;