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
      // Create admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);
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
    }

    // Create test users for different roles
    const testUsers = [
      {
        email: 'sarah.johnson@email.com',
        password: 'password123',
        name: 'Sarah Johnson',
        role: 'PROFESSIONAL',
        company: 'Tech Corp',
        location: 'New York',
        bio: 'Senior Frontend Developer with 5+ years of experience',
        skills: ['React', 'TypeScript', 'Node.js', 'UI/UX Design']
      },
      {
        email: 'mike.chen@email.com',
        password: 'password123',
        name: 'Mike Chen',
        role: 'STUDENT',
        location: 'California',
        bio: 'Computer Science student passionate about web development',
        skills: ['JavaScript', 'Python', 'React', 'Git']
      },
      {
        email: 'emma.davis@company.com',
        password: 'password123',
        name: 'Emma Davis',
        role: 'COMPANY',
        company: 'Startup Inc',
        location: 'Austin',
        bio: 'HR Manager at Startup Inc, looking for talented developers',
        skills: ['Recruitment', 'HR Management', 'Team Building']
      },
      {
        email: 'alex.wong@email.com',
        password: 'password123',
        name: 'Alex Wong',
        role: 'PROFESSIONAL',
        company: 'Big Tech Co',
        location: 'San Francisco',
        bio: 'Full-stack developer specializing in scalable applications',
        skills: ['Java', 'Spring Boot', 'React', 'AWS', 'Docker']
      },
      {
        email: 'lisa.garcia@email.com',
        password: 'password123',
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
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const user = await prisma.user.create({
          data: {
            ...userData,
            password: hashedPassword
          }
        });
        console.log(`✅ Created ${userData.role} user:`, user.email);
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
    console.log('\n🔑 Admin credentials:');
    console.log('  Email: admin@itcommunity.com');
    console.log('  Password: admin123');

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