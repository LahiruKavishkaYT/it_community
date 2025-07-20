const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('🔍 Creating admin user...');
    
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@itcommunity.com' }
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      console.log('Email:', existingAdmin.email);
      console.log('Role:', existingAdmin.role);
      return;
    }

    // Create admin user
    const adminPassword = 'SecureAdmin123!';
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@itcommunity.com',
        password: hashedPassword,
        name: 'Admin User',
        role: 'ADMIN',
        company: 'ITCommunity',
        location: 'Global',
        bio: 'System Administrator',
        skills: ['Administration', 'Management', 'System Design']
      }
    });
    
    console.log('✅ Created admin user:', adminUser.email);
    console.log('🔑 Admin credentials:');
    console.log('  Email: admin@itcommunity.com');
    console.log('  Password: SecureAdmin123!');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin(); 