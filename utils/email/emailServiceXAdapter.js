import EmailInterface from './interface.js';

class EmailServiceXAdapter extends EmailInterface {
    sendEmail(to, subject, text) {
        // Implement email sending using EmailServiceX
    }
}

export default new EmailServiceXAdapter();
