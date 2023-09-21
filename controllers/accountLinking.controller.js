// accountLinking.controller.js
import LinkedAccount from '../models/linkedAccounts.model.js';

export const linkAccount = async (req, res) => {
    try {
        const primaryUserId = req.user._id;
        const secondaryUserId = req.body.secondaryUserId;

        const linkExists = await LinkedAccount.findOne({
            $or: [
                { primaryUserId, secondaryUserId },
                { primaryUserId: secondaryUserId, secondaryUserId: primaryUserId }
            ]
        });

        if (linkExists) {
            return res.status(400).json({ message: 'Accounts are already linked.' });
        }

        const linkedAccount = new LinkedAccount({
            primaryUserId,
            secondaryUserId
        });

        await linkedAccount.save();

        res.status(200).json({ message: 'Accounts linked successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error linking accounts.', error: error.message });
    }
};

export const unlinkAccount = async (req, res) => {
    try {
        const primaryUserId = req.user._id;
        const secondaryUserId = req.body.secondaryUserId;

        const link = await LinkedAccount.findOne({
            $or: [
                { primaryUserId, secondaryUserId },
                { primaryUserId: secondaryUserId, secondaryUserId: primaryUserId }
            ]
        });

        if (!link) {
            return res.status(400).json({ message: 'Accounts are not linked.' });
        }

        await link.remove();

        res.status(200).json({ message: 'Accounts unlinked successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error unlinking accounts.', error: error.message });
    }
};
