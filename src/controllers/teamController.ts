import { Request, Response } from 'express';
import prisma from '../db';

export const getAll = async (req: Request, res: Response) => {
  try {
    const members = await prisma.teamMember.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return res.json(members);
  } catch (error: any) {
    console.error('Get all team members error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const create = async (req: Request, res: Response) => {
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
        } else if (Array.isArray(responsibilities)) {
          responsibilitiesJson = JSON.stringify(responsibilities);
        }
      } catch (e) {
        responsibilitiesJson = JSON.stringify([responsibilities]);
      }
    }

    const member = await prisma.teamMember.create({
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
  } catch (error: any) {
    console.error('Create team member error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, role, category, bio, experience, responsibilities } = req.body;

    const existingMember = await prisma.teamMember.findUnique({
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
        } else if (Array.isArray(responsibilities)) {
          responsibilitiesJson = JSON.stringify(responsibilities);
        }
      } catch (e) {
        responsibilitiesJson = JSON.stringify([responsibilities]);
      }
    }

    const updatedMember = await prisma.teamMember.update({
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
  } catch (error: any) {
    console.error('Update team member error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteMember = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existingMember = await prisma.teamMember.findUnique({
      where: { id }
    });

    if (!existingMember) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    await prisma.teamMember.delete({
      where: { id }
    });

    return res.json({ message: 'Team member deleted successfully' });
  } catch (error: any) {
    console.error('Delete team member error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
