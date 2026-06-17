import { Request, Response } from 'express';
import prisma from '../db';
import { uploadToCloudinary } from '../utils/cloudinary';

export const getAll = async (req: Request, res: Response) => {
  try {
    const vessels = await prisma.vessel.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return res.json(vessels);
  } catch (error: any) {
    console.error('Get all vessels error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getOne = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const vessel = await prisma.vessel.findUnique({
      where: { id }
    });

    if (!vessel) {
      return res.status(404).json({ error: 'Vessel not found' });
    }

    return res.json(vessel);
  } catch (error: any) {
    console.error('Get single vessel error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const {
      name,
      type,
      lengthOverall,
      breadth,
      draft,
      mainEngines,
      bhp,
      bollardPull,
      deckSpace,
      flag,
      fuelOil,
      freshWater,
      deckCargo,
      safetyCertifications,
      status
    } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required' });
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    
    // Process main image
    const imageFile = files?.['image']?.[0];
    const imageUrl = imageFile 
      ? await uploadToCloudinary(imageFile, 'vessels') 
      : '/uploads/default-vessel.jpeg';

    // Process gallery
    const galleryFiles = files?.['gallery'] || [];
    const galleryUrls = await Promise.all(
      galleryFiles.map(f => uploadToCloudinary(f, 'vessels/gallery'))
    );

    // Parse certifications
    let certificationsJson = '[]';
    if (safetyCertifications) {
      try {
        if (typeof safetyCertifications === 'string') {
          const parsed = JSON.parse(safetyCertifications);
          certificationsJson = Array.isArray(parsed) ? safetyCertifications : JSON.stringify([safetyCertifications]);
        } else if (Array.isArray(safetyCertifications)) {
          certificationsJson = JSON.stringify(safetyCertifications);
        }
      } catch (e) {
        certificationsJson = JSON.stringify([safetyCertifications]);
      }
    }

    const vessel = await prisma.vessel.create({
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
  } catch (error: any) {
    console.error('Create vessel error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      type,
      lengthOverall,
      breadth,
      draft,
      mainEngines,
      bhp,
      bollardPull,
      deckSpace,
      flag,
      fuelOil,
      freshWater,
      deckCargo,
      safetyCertifications,
      status,
      gallery // Option to pass parsed gallery filenames
    } = req.body;

    const existingVessel = await prisma.vessel.findUnique({
      where: { id }
    });

    if (!existingVessel) {
      return res.status(404).json({ error: 'Vessel not found' });
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    
    // Main image replacement
    const imageFile = files?.['image']?.[0];
    const imageUrl = imageFile 
      ? await uploadToCloudinary(imageFile, 'vessels') 
      : existingVessel.image;

    // Gallery replacement / updates
    let galleryUrls = JSON.parse(existingVessel.gallery);
    const galleryFiles = files?.['gallery'];

    if (galleryFiles && galleryFiles.length > 0) {
      // If new files uploaded, replace or append
      galleryUrls = await Promise.all(
        galleryFiles.map(f => uploadToCloudinary(f, 'vessels/gallery'))
      );
    } else if (gallery) {
      // If existing filenames list passed, keep them
      try {
        const parsedGallery = typeof gallery === 'string' ? JSON.parse(gallery) : gallery;
        if (Array.isArray(parsedGallery)) {
          galleryUrls = parsedGallery;
        }
      } catch (e) {
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
        } else if (Array.isArray(safetyCertifications)) {
          certificationsJson = JSON.stringify(safetyCertifications);
        }
      } catch (e) {
        certificationsJson = JSON.stringify([safetyCertifications]);
      }
    }

    const updatedVessel = await prisma.vessel.update({
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
  } catch (error: any) {
    console.error('Update vessel error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteVessel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existingVessel = await prisma.vessel.findUnique({
      where: { id }
    });

    if (!existingVessel) {
      return res.status(404).json({ error: 'Vessel not found' });
    }

    await prisma.vessel.delete({
      where: { id }
    });

    return res.json({ message: 'Vessel deleted successfully' });
  } catch (error: any) {
    console.error('Delete vessel error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
