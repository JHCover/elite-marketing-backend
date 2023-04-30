import dotenv from 'dotenv';

dotenv.config();

export default {
    NODE_ENV: process.env.NODE_ENV,
    BACKEND_PORT: process.env.BACKEND_PORT,
    FRONTEND_PORT: process.env.FRONTEND_PORT,
    URL: process.env.URL,
    MONGO_URI: process.env.MONGO_URI,
    MONGO_DB_NAME: process.env.MONGO_DB_NAME,
    JWT_SECRET: process.env.JWT_SECRET,
    EMAIL_SECRET: process.env.EMAIL_SECRET,
    GMAIL_USER: process.env.GMAIL_USER,
    GMAIL_PASS: process.env.GMAIL_PASS,
    MAIL_URL: process.env.MAIL_URL,
    CONFIRM_PAGE_URL: process.env.CONFIRM_PAGE_URL,
};
