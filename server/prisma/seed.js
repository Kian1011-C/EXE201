import { PrismaClient } from '@prisma/client';
import crypto from 'node:crypto';

const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64);
  return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`;
}

async function main() {
  console.log('Seeding database...');
  
  const accounts = [
    {
      id: 'ACC-001',
      name: 'Super Admin',
      email: 'admin@insurmatch.us',
      role: 'admin',
      avatar: 'SA',
      bg: 'bg-rose-700 text-white',
      status: 'Active',
      phone: '+1 (800) 555-0199',
      department: 'Platform Operations & System Governance',
      statesLicensed: ['National'],
      npn: 'MASTER-ADMIN',
      joinedDate: '2025-01-10',
      lastActive: 'Just now',
      complianceStatus: 'Verified & Cleared',
      passwordHash: hashPassword('Admin123!'),
      mustChangePassword: false
    },
    {
      id: 'ACC-002',
      name: 'Anya Nguyen',
      email: 'staff@insurmatch.us',
      role: 'staff',
      avatar: 'AN',
      bg: 'bg-teal-600 text-white',
      status: 'Active',
      phone: '+1 (832) 998-1122',
      department: 'Intake Coordination & Policy Support',
      statesLicensed: ['National Hub'],
      npn: 'STAFF-OPS',
      joinedDate: '2025-01-20',
      lastActive: '5 mins ago',
      complianceStatus: 'Verified & Cleared',
      passwordHash: hashPassword('Staff123!'),
      mustChangePassword: false
    },
    {
      id: 'ACC-003',
      name: 'Khanh Nguyen',
      email: 'agent@insurmatch.us',
      role: 'agent',
      avatar: 'KN',
      bg: 'bg-blue-600 text-white',
      status: 'Active',
      phone: '+1 (838) 776-1434',
      agencyRole: 'Senior Partner Agent',
      department: 'Medicare & ACA Sales Hub',
      statesLicensed: ['TX (TDI)', 'CA (CDI)', 'FL'],
      npn: '1984210',
      joinedDate: '2025-02-01',
      lastActive: '1 hour ago',
      complianceStatus: 'Verified & Cleared',
      passwordHash: hashPassword('Agent123!'),
      mustChangePassword: false
    }
  ];

  for (const account of accounts) {
    await prisma.user.upsert({
      where: { email: account.email },
      update: {},
      create: account,
    });
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
