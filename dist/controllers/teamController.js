"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMember = exports.update = exports.create = exports.getAll = void 0;
const db_1 = __importDefault(require("../db"));
const getAll = async (req, res) => {
    try {
        const members = await db_1.default.teamMember.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return res.json(members);
    }
    catch (error) {
        console.error('Get all team members error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getAll = getAll;
const create = async (req, res) => {
    try {
        const { name, role, category, bio, experience, responsibilities } = req.body;
        if (!name || !role || !category) {
            return res.status(400).json({ error: 'Name, role, and category are required' });
        }
        const validCategories = ['executive', 'management', 'supervisory'];
        if (!validCategories.includes(category)) {
            return res.status(400).json({ error: 'Category must be executive, management, or supervisory' });
        }
        // Single file upload via upload.single('image')
        const imageFile = req.file;
        const imageUrl = imageFile ? `/uploads/${imageFile.filename}` : '/uploads/default-member.jpeg';
        // Parse responsibilities
        let responsibilitiesJson = '[]';
        if (responsibilities) {
            try {
                if (typeof responsibilities === 'string') {
                    const parsed = JSON.parse(responsibilities);
                    responsibilitiesJson = Array.isArray(parsed) ? responsibilities : JSON.stringify([responsibilities]);
                }
                else if (Array.isArray(responsibilities)) {
                    responsibilitiesJson = JSON.stringify(responsibilities);
                }
            }
            catch (e) {
                responsibilitiesJson = JSON.stringify([responsibilities]);
            }
        }
        const member = await db_1.default.teamMember.create({
            data: {
                name,
                role,
                category,
                bio: bio || '',
                experience: experience || '',
                responsibilities: responsibilitiesJson,
                image: imageUrl
            }
        });
        return res.status(201).json(member);
    }
    catch (error) {
        console.error('Create team member error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.create = create;
const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, role, category, bio, experience, responsibilities } = req.body;
        const existingMember = await db_1.default.teamMember.findUnique({
            where: { id }
        });
        if (!existingMember) {
            return res.status(404).json({ error: 'Team member not found' });
        }
        if (category && !['executive', 'management', 'supervisory'].includes(category)) {
            return res.status(400).json({ error: 'Category must be executive, management, or supervisory' });
        }
        const imageFile = req.file;
        const imageUrl = imageFile ? `/uploads/${imageFile.filename}` : existingMember.image;
        let responsibilitiesJson = existingMember.responsibilities;
        if (responsibilities !== undefined) {
            try {
                if (typeof responsibilities === 'string') {
                    const parsed = JSON.parse(responsibilities);
                    responsibilitiesJson = Array.isArray(parsed) ? responsibilities : JSON.stringify([responsibilities]);
                }
                else if (Array.isArray(responsibilities)) {
                    responsibilitiesJson = JSON.stringify(responsibilities);
                }
            }
            catch (e) {
                responsibilitiesJson = JSON.stringify([responsibilities]);
            }
        }
        const updatedMember = await db_1.default.teamMember.update({
            where: { id },
            data: {
                name: name !== undefined ? name : existingMember.name,
                role: role !== undefined ? role : existingMember.role,
                category: category !== undefined ? category : existingMember.category,
                bio: bio !== undefined ? bio : existingMember.bio,
                experience: experience !== undefined ? experience : existingMember.experience,
                responsibilities: responsibilitiesJson,
                image: imageUrl
            }
        });
        return res.json(updatedMember);
    }
    catch (error) {
        console.error('Update team member error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.update = update;
const deleteMember = async (req, res) => {
    try {
        const { id } = req.params;
        const existingMember = await db_1.default.teamMember.findUnique({
            where: { id }
        });
        if (!existingMember) {
            return res.status(404).json({ error: 'Team member not found' });
        }
        await db_1.default.teamMember.delete({
            where: { id }
        });
        return res.json({ message: 'Team member deleted successfully' });
    }
    catch (error) {
        console.error('Delete team member error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.deleteMember = deleteMember;
