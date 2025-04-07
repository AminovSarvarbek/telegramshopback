const express = require("express");
const cors = require("cors");
const config = require("./src/config");
const fileUtils = require("./src/utils/fileUtils");
const telegramService = require("./src/services/telegramService");
const productRoutes = require("./src/routes/productRoutes");
const orderRoutes = require("./src/routes/orderRoutes");

// Initialize Express app
const app = express();

// Initialize data directory and files
fileUtils.initializeDataFiles();

// Middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Configure CORS to allow all origins during development
app.use(cors({
    credentials: true,
}));

app.use(express.json());

// Routes
app.use('/', productRoutes);
app.use('/', orderRoutes);

// Error handler
app.use((err, req, res, next) => {
    console.error('❌ Uncaught error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// Start server
const startServer = async () => {
    try {
        // Start Telegram bot

        // Start Express server
        app.listen(config.PORT, () => {
            console.log(`✅ Express server running at http://localhost:${config.PORT}`);
        });
        await telegramService.launch();


    } catch (error) {
        console.error("❌ Error starting server:", error);
        process.exit(1);
    }
};

// Start the server
startServer();
