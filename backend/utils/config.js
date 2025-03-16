require('dotenv').config();

module.exports = {
    port: process.env.PORT || 3000,
    dbHost: process.env.DB_HOST || 'localhost',
    dbUser: process.env.DB_USER || 'root',
    dbPassword: process.env.DB_PASSWORD || 'root',
    dbName: process.env.DB_NAME || 'xpensa',
    emailPassword: process.env.EMAIL_PASSWORD,
    frontEndUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    geminiApi : process.env.GEMINI_API || 'AIzaSyDpVKOigycfsHmsfkuCFAP8vJ9g7uY-bi8',
    backendurl : process.env.BACKEND_URL || `http://localhost:${this.port}`,
    mode : process.env.NODE_ENV || 'development',
};
