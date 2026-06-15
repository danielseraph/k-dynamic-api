"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteVessel = exports.update = exports.create = exports.getOne = exports.getAll = void 0;
const db_1 = __importDefault(require("../db"));
const getAll = async (req, res) => {
    try {
        const vessels = await db_1.default.vessel.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return res.json(vessels);
    }
    catch (error) {
        console.error('Get all vessels error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getAll = getAll;
const getOne = async (req, res) => {
    try {
        const { id } = req.params;
        const vessel = await db_1.default.vessel.findUnique({
            where: { id }
        });
        if (!vessel) {
            return res.status(404).json({ error: 'Vessel not found' });
        }
        return res.json(vessel);
    }
    catch (error) {
        console.error('Get single vessel error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getOne = getOne;
const create = async (req, res) => {
    try {
        const { name, type, lengthOverall, breadth, draft, mainEngines, bhp, bollardPull, deckSpace, flag, fuelOil, freshWater, deckCargo, safetyCertifications, status } = req.body;
        if (!name || !type) {
            return res.status(400).json({ error: 'Name and type are required' });
        }
        const files = req.files;
        // Process main image
        const imageFile = files?.['image']?.[0];
        const imageUrl = imageFile ? `/uploads/${imageFile.filename}` : '/uploads/default-vessel.jpeg';
        // Process gallery
        const galleryFiles = files?.['gallery'] || [];
        const galleryUrls = galleryFiles.map(f => `/uploads/${f.filename}`);
        // Parse certifications
        let certificationsJson = '[]';
        if (safetyCertifications) {
            try {
                if (typeof safetyCertifications === 'string') {
                    const parsed = JSON.parse(safetyCertifications);
                    certificationsJson = Array.isArray(parsed) ? safetyCertifications : JSON.stringify([safetyCertifications]);
                }
                else if (Array.isArray(safetyCertifications)) {
                    certificationsJson = JSON.stringify(safetyCertifications);
                }
            }
            catch (e) {
                certificationsJson = JSON.stringify([safetyCertifications]);
            }
        }
        const vessel = await db_1.default.vessel.create({
            data: {
                name,
                type,
                lengthOverall: lengthOverall || '',
                breadth: breadth || '',
                draft: draft || '',
                mainEngines: mainEngines || '',
                bhp: bhp || '',
                bollardPull: bollardPull || '',
                deckSpace: deckSpace || '',
                flag: flag || '',
                fuelOil: fuelOil || '',
                freshWater: freshWater || '',
                deckCargo: deckCargo || '',
                safetyCertifications: certificationsJson,
                status: status || 'Available',
                image: imageUrl,
                gallery: JSON.stringify(galleryUrls)
            }
        });
        return res.status(201).json(vessel);
    }
    catch (error) {
        console.error('Create vessel error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.create = create;
const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, type, lengthOverall, breadth, draft, mainEngines, bhp, bollardPull, deckSpace, flag, fuelOil, freshWater, deckCargo, safetyCertifications, status, gallery // Option to pass parsed gallery filenames
         } = req.body;
        const existingVessel = await db_1.default.vessel.findUnique({
            where: { id }
        });
        if (!existingVessel) {
            return res.status(404).json({ error: 'Vessel not found' });
        }
        const files = req.files;
        // Main image replacement
        const imageFile = files?.['image']?.[0];
        const imageUrl = imageFile ? `/uploads/${imageFile.filename}` : existingVessel.image;
        // Gallery replacement / updates
        let galleryUrls = JSON.parse(existingVessel.gallery);
        const galleryFiles = files?.['gallery'];
        if (galleryFiles && galleryFiles.length > 0) {
            // If new files uploaded, replace or append
            galleryUrls = galleryFiles.map(f => `/uploads/${f.filename}`);
        }
        else if (gallery) {
            // If existing filenames list passed, keep them
            try {
                const parsedGallery = typeof gallery === 'string' ? JSON.parse(gallery) : gallery;
                if (Array.isArray(parsedGallery)) {
                    galleryUrls = parsedGallery;
                }
            }
            catch (e) {
                // Fallback to existing if parsing error
            }
        }
        // Safety Certifications parsing
        let certificationsJson = existingVessel.safetyCertifications;
        if (safetyCertifications !== undefined) {
            try {
                if (typeof safetyCertifications === 'string') {
                    const parsed = JSON.parse(safetyCertifications);
                    certificationsJson = Array.isArray(parsed) ? safetyCertifications : JSON.stringify([safetyCertifications]);
                }
                else if (Array.isArray(safetyCertifications)) {
                    certificationsJson = JSON.stringify(safetyCertifications);
                }
            }
            catch (e) {
                certificationsJson = JSON.stringify([safetyCertifications]);
            }
        }
        const updatedVessel = await db_1.default.vessel.update({
            where: { id },
            data: {
                name: name !== undefined ? name : existingVessel.name,
                type: type !== undefined ? type : existingVessel.type,
                lengthOverall: lengthOverall !== undefined ? lengthOverall : existingVessel.lengthOverall,
                breadth: breadth !== undefined ? breadth : existingVessel.breadth,
                draft: draft !== undefined ? draft : existingVessel.draft,
                mainEngines: mainEngines !== undefined ? mainEngines : existingVessel.mainEngines,
                bhp: bhp !== undefined ? bhp : existingVessel.bhp,
                bollardPull: bollardPull !== undefined ? bollardPull : existingVessel.bollardPull,
                deckSpace: deckSpace !== undefined ? deckSpace : existingVessel.deckSpace,
                flag: flag !== undefined ? flag : existingVessel.flag,
                fuelOil: fuelOil !== undefined ? fuelOil : existingVessel.fuelOil,
                freshWater: freshWater !== undefined ? freshWater : existingVessel.freshWater,
                deckCargo: deckCargo !== undefined ? deckCargo : existingVessel.deckCargo,
                safetyCertifications: certificationsJson,
                status: status !== undefined ? status : existingVessel.status,
                image: imageUrl,
                gallery: JSON.stringify(galleryUrls)
            }
        });
        return res.json(updatedVessel);
    }
    catch (error) {
        console.error('Update vessel error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.update = update;
const deleteVessel = async (req, res) => {
    try {
        const { id } = req.params;
        const existingVessel = await db_1.default.vessel.findUnique({
            where: { id }
        });
        if (!existingVessel) {
            return res.status(404).json({ error: 'Vessel not found' });
        }
        await db_1.default.vessel.delete({
            where: { id }
        });
        return res.json({ message: 'Vessel deleted successfully' });
    }
    catch (error) {
        console.error('Delete vessel error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.deleteVessel = deleteVessel;
