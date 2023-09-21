// mail.js
import mailgun from 'mailgun-js';

const DOMAIN = process.env.MAILGUN_DOMAIN;
const mg = mailgun({ apiKey: process.env.MAILGUN_API_KEY, domain: DOMAIN });

function sendEmail(to, subject, text) {
    const data = {
        from: 'Order Taker <no-reply@order-taker.dgalanopoulos.eu>', // replace with your app's email
        to: to,
        subject: subject,
        text: text
    };

    mg.messages().send(data, (error, body) => {
        console.log(body);
    });
}

export { sendEmail };
