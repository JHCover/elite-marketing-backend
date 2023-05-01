import dotenv from 'dotenv';

dotenv.config();

export default {
    NODE_ENV: process.env.NODE_ENV,
    BACKEND_PORT: "5000",
    FRONTEND_PORT: process.env.FRONTEND_PORT,
    URL: "localhost:5000",
    MONGO_URI: "mongodb+srv://JHCover:starwars6@cluster0.chvvn.mongodb.net/?retryWrites=true&w=majority",
    MONGO_DB_NAME: process.env.MONGO_DB_NAME,
    JWT_SECRET: process.env.JWT_SECRET,
    EMAIL_SECRET: process.env.EMAIL_SECRET,
    GMAIL_USER: process.env.GMAIL_USER,
    GMAIL_PASS: process.env.GMAIL_PASS,
    MAIL_URL: process.env.MAIL_URL,
    CONFIRM_PAGE_URL: process.env.CONFIRM_PAGE_URL,
};
