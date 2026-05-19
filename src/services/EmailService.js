const nodemailer = require('nodemailer');
const config = require('../config/config');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: config.GOOGLE_USER_EMAIL,
        clientId: config.GOOGLE_CLIENT_ID,
        clientSecret: config.GOOGLE_CLIENT_SECRET,
        refreshToken: config.GOOGLE_REFRESH_TOKEN,
        accessToken: config.GOOGLE_ACCESS_TOKEN 
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.error('Error setting up email transporter:', error);
    } else {
        console.log('Email transporter is ready to send messages');
    }
});

exports.sendEmail = async (to, subject, text, html) => {
    try {
        const mailOptions = {
            from: config.GOOGLE_USER_EMAIL,
            to,
            subject,
            text,
            html
        };

        console.log("Sending email...");

        const result = await transporter.sendMail(mailOptions);

        console.log("✅ Email sent:", result);

    } catch (error) {
        console.error("❌ Error sending email:", error);
    }
};

    

