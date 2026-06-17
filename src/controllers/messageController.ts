import { Request, Response } from 'express';
import prisma from '../db';
import { sendEmailNotification } from '../utils/email';

export const create = async (req: Request, res: Response) => {
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
      } catch (e) {
        parsedQuoteDetails = String(quoteDetails);
      }
    }

    const newMessage = await prisma.message.create({
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
    sendEmailNotification(newMessage).catch(err => {
      console.error('[SMTP Alert Failure] Failed to trigger email alert:', err);
    });

    return res.status(201).json(newMessage);
  } catch (error: any) {
    console.error('Create message error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAll = async (req: Request, res: Response) => {
  try {
    const messages = await prisma.message.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return res.json(messages);
  } catch (error: any) {
    console.error('Get all messages error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    if (!['Unread', 'Read', 'Replied'].includes(status)) {
      return res.status(400).json({ error: 'Status must be Unread, Read, or Replied' });
    }

    const existingMessage = await prisma.message.findUnique({
      where: { id }
    });

    if (!existingMessage) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const updatedMessage = await prisma.message.update({
      where: { id },
      data: { status }
    });

    return res.json(updatedMessage);
  } catch (error: any) {
    console.error('Update message status error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteMessage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const existingMessage = await prisma.message.findUnique({
      where: { id }
    });

    if (!existingMessage) {
      return res.status(404).json({ error: 'Message not found' });
    }

    await prisma.message.delete({
      where: { id }
    });

    return res.json({ message: 'Message deleted successfully' });
  } catch (error: any) {
    console.error('Delete message error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
