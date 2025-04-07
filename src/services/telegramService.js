const { Telegraf } = require('telegraf');
const axios = require('axios');
const config = require('../config');
const fileUtils = require('../utils/fileUtils');


const TELEGRAM_API_BASE = `https://api.telegram.org/bot${config.BOT_TOKEN}`;



class TelegramService {
    constructor() {
        this.bot = new Telegraf(config.BOT_TOKEN);
        this.setupBotCommands();
    }

    setupBotCommands() {
        // Start command
        this.bot.command('start', (ctx) => {
            const userId = ctx.from.id;
            const isAdmin = config.getAdminIds().includes(userId.toString());
            
            if (isAdmin) {
                ctx.reply(
                    "👋 Salom, Admin! Bu bot orqali mahsulot rasmlarini yuklashingiz mumkin.",
                    this.getAdminKeyboard()
                );
            } else {
                ctx.reply(
                    "👋 Salom! Bizning do'konimizga xush kelibsiz!\n\n👤Botni sotib olish uchun: @aSarvarbek",
                    this.getUserKeyboard()
                );
            }
        });

        // Help command
        this.bot.command('help', (ctx) => {
            const userId = ctx.from.id;
            const isAdmin = config.getAdminIds().includes(userId.toString());
            
            if (isAdmin) {
                ctx.reply(
                    "🔹 Admin uchun yordam:\n\n" +
                    "- Mahsulotlar ro'yxatini ko'rish uchun /products buyrug'ini yuboring\n" +
                    "- Oxirgi buyurtmalarni ko'rish uchun /orders buyrug'ini yuboring"
                );
            } else {
                ctx.reply(
                    "🔹 Foydalanuvchi uchun yordam:\n\n" +
                    "- Do'kon ilovasini ochish uchun /start buyrug'ini yuboring\n" +
                    "- Savolingiz bo'lsa, admin bilan bog'laning: @aSarvarbek"
                );
            }
        });

        // Products command for admins
        this.bot.command('products', async (ctx) => {
            const userId = ctx.from.id;
            if (!config.getAdminIds().includes(userId.toString())) {
                return ctx.reply("⛔ Bu buyruq faqat adminlar uchun.");
            }

            const products = fileUtils.readMenuItems();
            if (products.length === 0) {
                return ctx.reply("ℹ️ Hozircha mahsulotlar yo'q.");
            }

            const message = products.map(p => 
                `📦 ${p.name}\n` +
                `💰 Narxi: $${p.price}\n` +
                `📝 ID: ${p.id}\n` +
                `➖➖➖➖➖➖`
            ).join('\n');

            await ctx.reply(
                "🏪 Mahsulotlar ro'yxati:\n\n" + message,
                this.getAdminKeyboard()
            );
        });

        // Orders command for admins
        this.bot.command('orders', async (ctx) => {
            const userId = ctx.from.id;
            if (!config.getAdminIds().includes(userId.toString())) {
                return ctx.reply("⛔ Bu buyruq faqat adminlar uchun.");
            }

            const orders = fileUtils.readOrders();
            const recentOrders = orders.slice(-5); // Get last 5 orders

            if (recentOrders.length === 0) {
                return ctx.reply("ℹ️ Hozircha buyurtmalar yo'q.");
            }

            for (const order of recentOrders) {
                const orderDetails = order.items.map(item => 
                    `- ${item.name} x${item.quantity} = $${(item.price * item.quantity).toFixed(2)}`
                ).join('\n');

                const message = `📦 Buyurtma: ${order.id}\n` +
                    `👤 Xaridor: ${order.user ? order.user.first_name : 'Noma\'lum'}\n` +
                    `📅 Vaqti: ${new Date(order.createdAt).toLocaleString('uz-UZ')}\n` +
                    `🛍️ Mahsulotlar:\n${orderDetails}\n` +
                    `💰 Jami: $${order.total.toFixed(2)}\n` +
                    `📊 Status: ${order.status}\n`;

                await ctx.reply(message);
            }
        });

        // Handle photos for admins
        this.bot.on('photo', async (ctx) => {
            const userId = ctx.from.id;
            const isAdmin = config.getAdminIds().includes(userId.toString());
            
            if (!isAdmin) {
                return ctx.reply("⛔ Faqat adminlar rasm yuklay oladi.");
            }
            
            try {
                const photoSizes = ctx.message.photo;
                const photo = photoSizes[photoSizes.length - 1];
                const fileLink = await ctx.telegram.getFileLink(photo.file_id);
                
                ctx.reply(
                    `✅ Rasm muvaffaqiyatli yuklandi!\n\n` +
                    `🔗 URL: ${fileLink.href}\n\n` +
                    `Bu URL ni mahsulot rasmi sifatida ishlatishingiz mumkin.`
                );
                
            } catch (error) {
                console.error("❌ Rasm yuklashda xatolik:", error);
                ctx.reply("❌ Rasmni yuklashda xatolik yuz berdi. Iltimos, qayta urinib ko'ring.");
            }
        });

        // Handle other messages
        this.bot.on('message', (ctx) => {
            // Skip handling of photo messages (already handled above)
            if (ctx.message.photo) return;
            
            const userId = ctx.from.id;
            const isAdmin = config.getAdminIds().includes(userId.toString());
            
            if (isAdmin) {
                ctx.reply("🖼️ Mahsulot uchun rasm yuklash uchun rasmni botga yuboring.");
            } else {
                ctx.reply(
                    "👋 Bizning do'konimizga xush kelibsiz!",
                    this.getUserKeyboard()
                );
            }
        });
    }

    // Upload image to Telegram
    async uploadImage(buffer, filename) {
        try {
            const result = await this.bot.telegram.sendPhoto(config.ADMIN_CHAT_ID, {
                source: buffer,
                filename
            });

            const photo = result.photo[result.photo.length - 1];
            const fileLink = await this.bot.telegram.getFileLink(photo.file_id);

            return {
                success: true,
                url: fileLink.href,
                fileId: photo.file_id
            };
        } catch (error) {
            console.error("❌ Error uploading image to Telegram:", error);
            throw new Error("Failed to upload image");
        }
    }

    // Send order notification
    async sendOrderNotification(order) {
        try {
            const orderDetails = order.items.map(item => 
                `- ${item.name} x${item.quantity} = $${(item.price * item.quantity).toFixed(2)}`
            ).join('\n');
            
            const message = `🆕 Yangi buyurtma qabul qilindi!
    ${order.user ? `Foydalanuvchi: <a href="tg://user?id=${order.user.id}">${order.user.first_name}</a>` : 'Foydalanuvchi: Noma\'lum'}
    
    ${orderDetails}
    
    💰 Umumiy: $${order.total.toFixed(2)}`;
    
            const response = await axios.post(`${TELEGRAM_API_BASE}/sendMessage`, {
                chat_id: config.ADMIN_CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            });
    
            if (!response.data.ok) {
                throw new Error(`Telegram API error: ${response.data.description}`);
            }
    
            return response.data;
        } catch (error) {
            console.error("❌ Error sending order notification:", error.response?.data || error.message);
            throw error;
        }
    }

    // Get admin keyboard
    getAdminKeyboard() {
        return {
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: "🌐 WebApp'ni ochish",
                        web_app: { url: config.WEBAPP_URL }
                    }],
                    [{
                        text: "🌐 Admin panel",
                        web_app: { url: `${config.WEBAPP_URL}/admin` }
                    }]
                ]
            }
        };
    }

    // Get user keyboard
    getUserKeyboard() {
        return {
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: "🛒 Do'konga kirish",
                        web_app: { url: config.WEBAPP_URL }
                    }]
                ]
            }
        };
    }

    // Launch bot
    async launch() {
        try {
            await this.bot.launch();
            console.log("🤖 Telegram bot started successfully");
            
            // Enable graceful stop
            process.once('SIGINT', () => this.bot.stop('SIGINT'));
            process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
        } catch (error) {
            console.error("❌ Failed to start Telegram bot:", error);
            throw error;
        }
    }
}

module.exports = new TelegramService();
