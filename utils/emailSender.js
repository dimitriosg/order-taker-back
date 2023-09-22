import MailgunAdapter from './email/mailgunAdapter.js';
// import EmailServiceXAdapter from './email/emailServiceXAdapter.js';  // Uncomment to switch to EmailServiceX

const emailAdapter = MailgunAdapter;
// const emailAdapter = EmailServiceXAdapter;  // Uncomment to switch to EmailServiceX

export function sendEmail(to, subject, text) {
    return emailAdapter.sendEmail(to, subject, text);
}
