"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEquipment = exports.update = exports.create = exports.getAll = void 0;
const db_1 = __importDefault(require("../db"));
const cloudinary_1 = require("../utils/cloudinary");
const getAll = async (req, res) => {
    try {
        const equipment = await db_1.default.equipment.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return res.json(equipment);
    }
    catch (error) {
        console.error('Get all equipment error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getAll = getAll;
const create = async (req, res) => {
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
            ? await (0, cloudinary_1.uploadToCloudinary)(imageFile, 'equipment')
            : '/uploads/default-equipment.jpeg';
        const parsedQuantity = quantity ? parseInt(quantity, 10) : 1;
        const item = await db_1.default.equipment.create({
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
    }
    catch (error) {
        console.error('Create equipment error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.create = create;
const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, type, specs, quantity, status, description } = req.body;
        const existingItem = await db_1.default.equipment.findUnique({
            where: { id }
        });
        if (!existingItem) {
            return res.status(404).json({ error: 'Equipment item not found' });
        }
        if (type && !['Fenders', 'Hoses', 'Anchors', 'Spill Response', 'Other'].includes(type)) {
            return res.status(400).json({ error: 'Invalid equipment type' });
        }
        const imageFile = req.file;
        let imageUrl = existingItem.image;
        if (imageFile) {
            imageUrl = await (0, cloudinary_1.uploadToCloudinary)(imageFile, 'equipment');
        }
        else if (req.body.image) {
            imageUrl = req.body.image;
        }
        let parsedQuantity = existingItem.quantity;
        if (quantity !== undefined) {
            const parsed = parseInt(quantity, 10);
            parsedQuantity = isNaN(parsed) ? existingItem.quantity : parsed;
        }
        const updatedItem = await db_1.default.equipment.update({
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
    }
    catch (error) {
        console.error('Update equipment error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.update = update;
const deleteEquipment = async (req, res) => {
    try {
        const { id } = req.params;
        const existingItem = await db_1.default.equipment.findUnique({
            where: { id }
        });
        if (!existingItem) {
            return res.status(404).json({ error: 'Equipment item not found' });
        }
        await db_1.default.equipment.delete({
            where: { id }
        });
        return res.json({ message: 'Equipment deleted successfully' });
    }
    catch (error) {
        console.error('Delete equipment error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.deleteEquipment = deleteEquipment;
