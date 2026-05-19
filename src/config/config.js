const dotenv = require('dotenv');

dotenv.config();

if(!process.env.MONGO_URI) {
    console.error("MONGO_URI is not defined in the environment variables");
    process.exit(1);
}

if(!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not defined in the environment variables");
    process.exit(1);
}

if(!process.env.PORT) {
    console.warn("PORT is not defined in the environment variables, defaulting to 3000");
}

if(!process.env.GOOGLE_CLIENT_ID) {
    console.error("GOOGLE_CLIENT_ID is not defined in the environment variables");
    process.exit(1);
}

if(!process.env.GOOGLE_CLIENT_SECRET) {
    console.error("GOOGLE_CLIENT_SECRET is not defined in the environment variables");
    process.exit(1);
}

if(!process.env.GOOGELE_REFRESH_TOKEN) {
    console.error("GOOGELE_REFRESH_TOKEN is not defined in the environment variables");
    process.exit(1);
}

if(!process.env.GOOGLE_ACCESS_TOKEN) {
    console.error("GOOGLE_ACCESS_TOKEN is not defined in the environment variables");
    process.exit(1);
}

if(!process.env.GOOGELE_USER_EMAIL) {
    console.error("GOOGELE_USER_EMAIL is not defined in the environment variables");
    process.exit(1);
}

const config = {
    MONGO_URI: process.env.MONGO_URI,
    PORT: process.env.PORT || 3000,
    JWT_SECRET: process.env.JWT_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_REFRESH_TOKEN: process.env.GOOGELE_REFRESH_TOKEN,
    GOOGLE_ACCESS_TOKEN: process.env.GOOGLE_ACCESS_TOKEN,
    GOOGLE_USER_EMAIL: process.env.GOOGELE_USER_EMAIL,
};

module.exports = config;