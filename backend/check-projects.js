const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkProjects() {
  try {
    console.log('🔍 Checking projects in database...\n');
    
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📊 Found ${projects.length} projects:\n`);
    
    projects.forEach((project, index) => {
      console.log(`${index + 1}. ID: ${project.id}`);
      console.log(`   Title: ${project.title}`);
      console.log(`   Status: ${project.status}`);
      console.log(`   Created: ${project.createdAt}`);
      console.log('');
    });

    if (projects.length === 0) {
      console.log('❌ No projects found in database!');
      console.log('💡 You may need to seed the database with some projects.');
    }

  } catch (error) {
    console.error('❌ Error checking projects:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProjects(); 