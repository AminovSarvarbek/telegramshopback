# Telegram Shop Bot

This bot handles product management and order processing for the Telegram Shop Web App.

## Setup

1. Create a `.env` file in the bot directory with the following variables:
```
PORT=3000
TELEGRAM_BOT_TOKEN=your_bot_token_here
ADMIN_CHAT_ID=your_admin_chat_id_here
WEBAPP_URL=http://localhost:5173
```

2. Install dependencies:
```bash
npm install
```

3. Start the bot:
```bash
npm start
```

## Admin Features

### Bot Commands
- `/start` - Start the bot and get the main menu
- `/help` - Show available commands
- `/products` - List all products (admin only)
- `/orders` - Show recent orders (admin only)

### Image Upload
To add product images:
1. Send an image directly to the bot
2. The bot will respond with a permanent HTTPS URL
3. Use this URL when creating or editing products in the admin panel

### Product Management
- Images are automatically uploaded to Telegram servers
- All product images are served via HTTPS
- Maximum image size: 5MB

## Directory Structure
```
bot/
├── src/
│   ├── config/       # Configuration
│   ├── controllers/  # Request handlers
│   ├── middlewares/  # Auth & other middleware
│   ├── routes/       # API routes
│   ├── services/     # Business logic
│   └── utils/        # Helper functions
├── data/            # JSON storage
└── index.js         # Entry point
```

## API Endpoints

### Products
- `GET /menu` - Get all products
- `POST /admin/products` - Add new product (admin)
- `PUT /admin/products/:id` - Update product (admin)
- `DELETE /admin/products/:id` - Delete product (admin)

### Orders
- `POST /orders` - Create new order
- `GET /admin/orders` - Get all orders (admin)
- `GET /admin/orders/:id` - Get order by ID (admin)
- `PUT /admin/orders/:id/status` - Update order status (admin)