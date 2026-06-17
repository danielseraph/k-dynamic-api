"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMessage = exports.updateStatus = exports.getAll = exports.create = void 0;
const db_1 = __importDefault(require("../db"));
const email_1 = require("../utils/email");
const create = async (req, res) => {
    try {
        const { name, email, phone, company, serviceNeeded, message, messageType, quoteDetails } = req.body;
        if (!name || !email || !message || !messageType) {
            return res.status(400).json({ error: 'Name, email, message, and messageType are required' });
        }
        if (!['Contact', 'Quote'].includes(messageType)) {
            return res.status(400).json({ error: 'messageType must be Contact or Quote' });
        }
        let parsedQuoteDetails = null;
        if (quoteDetails) {
            try {
                parsedQuoteDetails = typeof quoteDetails === 'string' ? quoteDetails : JSON.stringify(quoteDetails);
            }
            catch (e) {
                parsedQuoteDetails = String(quoteDetails);
            }
        }
        const newMessage = await db_1.default.message.create({
            data: {
                name,
                email,
                phone: phone || '',
                company: company || '',
                serviceNeeded: serviceNeeded || '',
                message,
                messageType,
                status: 'Unread',
                quoteDetails: parsedQuoteDetails
            }
        });
        // Dispatch automated email notification asynchronously without blocking client HTTP response
        (0, email_1.sendEmailNotification)(newMessage).catch(err => {
            console.error('[SMTP Alert Failure] Failed to trigger email alert:', err);
        });
        return res.status(201).json(newMessage);
    }
    catch (error) {
        console.error('Create message error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.create = create;
const getAll = async (req, res) => {
    try {
        const messages = await db_1.default.message.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return res.json(messages);
    }
    catch (error) {
        console.error('Get all messages error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getAll = getAll;
const updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ error: 'Status is required' });
        }
        if (!['Unread', 'Read', 'Replied'].includes(status)) {
            return res.status(400).json({ error: 'Status must be Unread, Read, or Replied' });
        }
        const existingMessage = await db_1.default.message.findUnique({
            where: { id }
        });
        if (!existingMessage) {
            return res.status(404).json({ error: 'Message not found' });
        }
        const updatedMessage = await db_1.default.message.update({
            where: { id },
            data: { status }
        });
        return res.json(updatedMessage);
    }
    catch (error) {
        console.error('Update message status error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.updateStatus = updateStatus;
const deleteMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const existingMessage = await db_1.default.message.findUnique({
            where: { id }
        });
        if (!existingMessage) {
            return res.status(404).json({ error: 'Message not found' });
        }
        await db_1.default.message.delete({
            where: { id }
        });
        return res.json({ message: 'Message deleted successfully' });
    }
    catch (error) {
        console.error('Delete message error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.deleteMessage = deleteMessage;
