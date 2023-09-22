// invitations.controller.js
import Invitation from '../models/invitations.model.js';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../utils/emailSender.js';

export const inviteUser = async (req, res) => {
    try {
        const email = req.body.email;
        const invitedBy = req.user.id;

        const existingInvitation = await Invitation.findOne({ email, status: 'pending' });
        if (existingInvitation) {
            return res.status(400).json({ message: 'An invitation for this email is already pending.' });
        }

        const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const expirationDate = new Date(new Date().getTime() + 60 * 60 * 1000);  // 1 hour from now

        const invitation = new Invitation({
            email,
            invitedBy,
            token,
            expirationDate
        });

        await invitation.save();

        // Send the email using your utility
        const inviteUrl = `https://order-taker.dgalanopoulos.eu/accept-invite?token=${token}`;
        await sendEmail(email, 'You are invited!', `Click here to accept the invitation: ${inviteUrl}`);

        res.status(200).json({ message: 'Invitation sent successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error sending invitation.', error: error.message });
    }
};

export const acceptInvitation = async (req, res) => {
    try {
        const token = req.body.token;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const invitation = await Invitation.findOne({ token, email: decoded.email, status: 'pending' });
        if (!invitation) {
            return res.status(400).json({ message: 'Invalid or expired invitation.' });
        }

        // Logic to create the new user account or whatever action you want to perform
        // ...

        // Update the status of the invitation to accepted
        invitation.status = 'accepted';
        await invitation.save();

        res.status(200).json({ message: 'Invitation accepted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error accepting invitation.', error: error.message });
    }
};

export const rejectInvitation = async (req, res) => {
    try {
        const token = req.body.token;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const invitation = await Invitation.findOne({ token, email: decoded.email, status: 'pending' });
        if (!invitation) {
            return res.status(400).json({ message: 'Invalid invitation.' });
        }

        // Update the status of the invitation to rejected
        invitation.status = 'rejected';
        await invitation.save();

        res.status(200).json({ message: 'Invitation rejected.' });
    } catch (error) {
        res.status(500).json({ message: 'Error rejecting invitation.', error: error.message });
    }
};
