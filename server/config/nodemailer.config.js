const nodemailer = require('nodemailer');

module.exports = {
    transporter: nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        auth: {
            user: process.env.EMAIL_LOGIN, // email login
            pass: process.env.EMAIL_PASSWORD // email password
        }
    })
}