const config = require('../config');

const checkUser = (req, res, next) => {
    try {
        const userHeader = req.headers.user;
        if (!userHeader) {
            return res.status(401).json({
                success: false,
                message: 'User data not provided'
            });
        }

        const user = JSON.parse(userHeader);
        req.user = user;
        next();
    } catch (error) {
        console.error('❌ Auth error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid user data'
        });
    }
};

const checkAdmin = (req, res, next) => {
    try {
        const userHeader = req.headers.user;
        if (!userHeader) {
            return res.status(401).json({
                success: false,
                message: 'User data not provided'
            });
        }

        const user = JSON.parse(userHeader);
        const adminIds = config.getAdminIds();
        
        if (!adminIds.includes(String(user.id))) {
            return res.status(403).json({
                success: false,
                message: 'User is not an admin'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('❌ Admin auth error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid user data'
        });
    }
};

module.exports = {
    checkUser,
    checkAdmin
};