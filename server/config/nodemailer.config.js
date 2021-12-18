const nodemailer = require('nodemailer');

module.exports = {
    transporter: nodemailer.createTransport({
        service: 'yandex',
        host: 'smtp.yandex.ru',
        auth: {
            user: process.env.EMAIL_LOGIN, // email login
            pass: process.env.EMAIL_PASSWORD // email password
        }
    })
}