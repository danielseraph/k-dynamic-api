import { Request, Response } from 'express';
import prisma from '../db';
import { uploadToCloudinary } from '../utils/cloudinary';

export const getAll = async (req: Request, res: Response) => {
  try {
    const equipment = await prisma.equipment.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return res.json(equipment);
  } catch (error: any) {
    console.error('Get all equipment error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const { name, type, specs, quantity, status, description } = req.body;

    if (!name || !type || !specs) {
      return res.status(400).json({ error: 'Name, type, and specs are required' });
    }

    const validTypes = ['Fenders', 'Hoses', 'Anchors', 'Spill Response', 'Other'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: `Type must be one of: ${validTypes.join(', ')}` });
    }

    const imageFile = req.file;
    const imageUrl = imageFile 
      ? await uploadToCloudinary(imageFile, 'equipment') 
      : '/uploads/default-equipment.jpeg';

    const parsedQuantity = quantity ? parseInt(quantity, 10) : 1;

    const item = await prisma.equipment.create({
      data: {
        name,
        type,
        specs,
        quantity: isNaN(parsedQuantity) ? 1 : parsedQuantity,
        status: status || 'Available',
        image: imageUrl,
        description: description || ''
      }
    });

    return res.status(201).json(item);
  } catch (error: any) {
    console.error('Create equipment error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, type, specs, quantity, status, description } = req.body;

    const existingItem = await prisma.equipment.findUnique({
      where: { id }
    });

    if (!existingItem) {
      return res.status(404).json({ error: 'Equipment item not found' });
    }

    if (type && !['Fenders', 'Hoses', 'Anchors', 'Spill Response', 'Other'].includes(type)) {
      return res.status(400).json({ error: 'Invalid equipment type' });
    }

    const imageFile = req.file;
    const imageUrl = imageFile 
      ? await uploadToCloudinary(imageFile, 'equipment') 
      : existingItem.image;

    let parsedQuantity = existingItem.quantity;
    if (quantity !== undefined) {
      const parsed = parseInt(quantity, 10);
      parsedQuantity = isNaN(parsed) ? existingItem.quantity : parsed;
    }

    const updatedItem = await prisma.equipment.update({
      where: { id },
      data: {
        name: name !== undefined ? name : existingItem.name,
        type: type !== undefined ? type : existingItem.type,
        specs: specs !== undefined ? specs : existingItem.specs,
        quantity: parsedQuantity,
        status: status !== undefined ? status : existingItem.status,
        image: imageUrl,
        description: description !== undefined ? description : existingItem.description
      }
    });

    return res.json(updatedItem);
  } catch (error: any) {
    console.error('Update equipment error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteEquipment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existingItem = await prisma.equipment.findUnique({
      where: { id }
    });

    if (!existingItem) {
      return res.status(404).json({ error: 'Equipment item not found' });
    }

    await prisma.equipment.delete({
      where: { id }
    });

    return res.json({ message: 'Equipment deleted successfully' });
  } catch (error: any) {
    console.error('Delete equipment error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
