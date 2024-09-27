const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 587,
    secure: false,
    auth: {
        user: "bf8ee517ed01e1",
        pass: "4de5f3af5c9007",
    },
});

function sendEmail(data, to) {
    const mailOption = {
        "from": "no-reply@mugglepay.com",
        "to": to,
        "subject": "Latest price of Bitcoin",
        "text": data,
    };

    transporter.sendMail(mailOption, function(error, info) {
        if(error) {
            console.log(`There's error when sending the email: ${error}`);
        }
        console.log(`Email has been sent: ${info.response}`);
    });
}

module.exports = sendEmail;