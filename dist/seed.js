"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Clearing existing records...');
    // Clear existing records
    await prisma.admin.deleteMany();
    await prisma.vessel.deleteMany();
    await prisma.teamMember.deleteMany();
    await prisma.equipment.deleteMany();
    await prisma.message.deleteMany();
    console.log('Creating default admin...');
    // Create default admin
    const passwordHash = await bcryptjs_1.default.hash('admin1234', 10);
    await prisma.admin.create({
        data: {
            username: 'admin',
            email: 'admin@ktechdynamic.com',
            passwordHash
        }
    });
    console.log('Seeding default vessels...');
    // Seed default vessels
    await prisma.vessel.createMany({
        data: [
            {
                name: 'KT TORNADO',
                type: 'Anchor Handling Tug Supply (AHTS)',
                lengthOverall: '65.00 m',
                breadth: '16.00 m',
                draft: '5.20 m',
                mainEngines: '2 x Wärtsilä 9L26 (Total 8,000 BHP)',
                bhp: '8,000 BHP',
                bollardPull: '105 Metric Tons',
                deckSpace: '450 m²',
                flag: 'Nigerian (NIMASA Registered)',
                fuelOil: '650 m³',
                freshWater: '400 m³',
                deckCargo: '1,200 Metric Tons',
                safetyCertifications: JSON.stringify([
                    'NIMASA Certified Sea-worthiness',
                    'American Bureau of Shipping (ABS) Class +A1',
                    'SOLAS Safety Construction & Equipment',
                    'ISM Code Compliant',
                    'ISPS Security Certificate'
                ]),
                status: 'Available',
                image: '/uploads/default-vessel.jpeg',
                gallery: JSON.stringify([])
            },
            {
                name: 'KT EXPRESS',
                type: 'Crew Boat / Fast Utility Vessel',
                lengthOverall: '36.00 m',
                breadth: '7.60 m',
                draft: '1.80 m',
                mainEngines: '3 x Cummins KTA38-M2 (Total 4,050 BHP)',
                bhp: '4,050 BHP',
                bollardPull: 'N/A',
                deckSpace: '90 m²',
                flag: 'Nigerian (NIMASA Registered)',
                fuelOil: '45 m³',
                freshWater: '25 m³',
                deckCargo: '50 Metric Tons',
                safetyCertifications: JSON.stringify([
                    'NIMASA Fast Passenger Vessel Certification',
                    'Bureau Veritas (BV) Cargo/Passenger Class',
                    'SOLAS Safety Radio & Life-saving Equipment',
                    'ISM Code Compliant'
                ]),
                status: 'Available',
                image: '/uploads/default-vessel.jpeg',
                gallery: JSON.stringify([])
            }
        ]
    });
    console.log('Seeding default team members...');
    // Seed team members
    await prisma.teamMember.create({
        data: {
            name: 'Mike Ayibakuro Boukoru',
            role: 'CEO / Managing Director',
            category: 'executive',
            bio: 'Mike Ayibakuro Boukoru is a seasoned maritime executive with extensive experience overseeing offshore logistics, marine operations, and fleet expansion.',
            experience: '15+ years in offshore logistics & maritime management',
            responsibilities: JSON.stringify([
                'Strategic leadership and expansion direction',
                'Key stakeholders and government relations',
                'Fleet acquisition and joint-venture strategies'
            ]),
            image: '/uploads/default-member.jpeg'
        }
    });
    console.log('Seeding initial equipment records...');
    // Seed initial equipment
    await prisma.equipment.create({
        data: {
            name: 'Yokohama Pneumatic Fender',
            type: 'Fenders',
            specs: 'Standard Size, high-pressure absorption capability.',
            quantity: 4,
            status: 'Available',
            image: '/uploads/default-equipment.jpeg',
            description: 'Marine-grade floating pneumatic rubber fenders.'
        }
    });
    console.log('Database seeded successfully!');
}
main()
    .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
