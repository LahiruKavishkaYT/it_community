const { PrismaClient } = require('../generated/prisma');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function seedUsers() {
  try {
    console.log('🌱 Seeding users...');

    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@itcommunity.com' }
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists');
    } else {
      if (process.env.NODE_ENV === 'production' && !process.env.ADMIN_PASSWORD) {
        throw new Error('ADMIN_PASSWORD must be set in production. Aborting seeding.');
      }

      // Create admin user with secure password from environment (mandatory in prod, default only in dev)
      const adminPassword = process.env.ADMIN_PASSWORD || 'SecureAdmin123!';
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
      if (process.env.NODE_ENV !== 'production') {
        console.log('🔑 Admin password:', adminPassword);
      } else {
        console.log('ℹ️  Admin password set via environment variable.');
      }
    }

    // Generate secure random password for test users
    const generateSecurePassword = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
      return Array.from({length: 12}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    };

    // Create test users for different roles
    const testUsers = [
      {
        email: 'sarah.johnson@email.com',
        password: generateSecurePassword(),
        name: 'Sarah Johnson',
        role: 'PROFESSIONAL',
        company: 'Tech Corp',
        location: 'New York',
        bio: 'Senior Frontend Developer with 5+ years of experience',
        skills: ['React', 'TypeScript', 'Node.js', 'UI/UX Design']
      },
      {
        email: 'mike.chen@email.com',
        password: generateSecurePassword(),
        name: 'Mike Chen',
        role: 'STUDENT',
        location: 'California',
        bio: 'Computer Science student passionate about web development',
        skills: ['JavaScript', 'Python', 'React', 'Git']
      },
      {
        email: 'emma.davis@company.com',
        password: generateSecurePassword(),
        name: 'Emma Davis',
        role: 'COMPANY',
        company: 'Startup Inc',
        location: 'Austin',
        bio: 'HR Manager at Startup Inc, looking for talented developers',
        skills: ['Recruitment', 'HR Management', 'Team Building']
      },
      {
        email: 'alex.wong@email.com',
        password: generateSecurePassword(),
        name: 'Alex Wong',
        role: 'PROFESSIONAL',
        company: 'Big Tech Co',
        location: 'San Francisco',
        bio: 'Full-stack developer specializing in scalable applications',
        skills: ['Java', 'Spring Boot', 'React', 'AWS', 'Docker']
      },
      {
        email: 'lisa.garcia@email.com',
        password: generateSecurePassword(),
        name: 'Lisa Garcia',
        role: 'STUDENT',
        location: 'Texas',
        bio: 'Graduate student in Software Engineering',
        skills: ['Java', 'C++', 'Data Structures', 'Algorithms']
      }
    ];

    for (const userData of testUsers) {
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(userData.password, 12);
        const user = await prisma.user.create({
          data: {
            ...userData,
            password: hashedPassword
          }
        });
        console.log(`✅ Created ${userData.role} user:`, user.email);
        if (process.env.NODE_ENV !== 'production') {
          console.log(`   • Password: ${userData.password}`);
        }
      } else {
        console.log(`⏭️  ${userData.role} user already exists:`, userData.email);
      }
    }

    // Get total user count
    const totalUsers = await prisma.user.count();
    console.log(`\n📊 Total users in database: ${totalUsers}`);

    // Get users by role
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        role: true
      }
    });

    console.log('\n👥 Users by role:');
    usersByRole.forEach(group => {
      console.log(`  ${group.role}: ${group._count.role}`);
    });

    console.log('\n🎉 User seeding completed successfully!');
    if (process.env.NODE_ENV !== 'production') {
      console.log('\n🔑 Admin credentials:');
      console.log('  Email: admin@itcommunity.com');
      console.log('  Password:', process.env.ADMIN_PASSWORD || 'SecureAdmin123!');
    }

  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function
seedUsers()
  .then(() => {
    console.log('✅ Database seeding completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }); 