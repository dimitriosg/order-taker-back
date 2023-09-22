<<<<<<< HEAD
import AwsSesAdapter from "./email/awsSesAdapter";

const emailAdapter = AwsSesAdapter;
=======
// import EmailServiceXAdapter from './email/emailServiceXAdapter.js';  // Uncomment to switch to EmailServiceX
//import MailgunAdapter from './email/mailgunAdapter.js';
import AwsSesAdapter from "./email/awsSesAdapter";

const emailAdapter = AwsSesAdapter;
// const emailAdapter = EmailServiceXAdapter;  // Uncomment to switch to EmailServiceX
>>>>>>> b2008d81e1474c0a9da9b24c3f81822b6756805c

export function sendEmail(to, subject, text) {
    return emailAdapter.sendEmail(to, subject, text);
}

