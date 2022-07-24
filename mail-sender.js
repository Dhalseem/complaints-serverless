
const nodemailer = require("nodemailer");
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'avithemad@gmail.com',
        pass: 'gwdegupxutbqaddo'
    }
});

var mailOptions = {
    from: 'complaint-notifier@gmail.com',
    to: 'avithemad@gmail.com',
    subject: 'Sending Email using Node.js',
    text: 'That was easy!'
};

transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
        console.log(error);
    } else {
        console.log('Email sent: ' + info.response);
    }
});