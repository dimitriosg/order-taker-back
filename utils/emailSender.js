// import EmailServiceXAdapter from './email/emailServiceXAdapter.js';  // Uncomment to switch to EmailServiceX
//import MailgunAdapter from './email/mailgunAdapter.js';
import AwsSesAdapter from "./email/awsSesAdapter";

const emailAdapter = AwsSesAdapter;
// const emailAdapter = EmailServiceXAdapter;  // Uncomment to switch to EmailServiceX

export function sendEmail(to, subject, text) {
    return emailAdapter.sendEmail(to, subject, text);
}
