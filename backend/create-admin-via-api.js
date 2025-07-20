const bcrypt = require('bcrypt');

// Since we can't use Prisma directly due to generation issues,
// let's create a simple script that can be run after the backend is running

async function createAdminViaAPI() {
  try {
    console.log('🔍 Creating admin user via API...');
    
    // Admin user data
    const adminData = {
      email: 'admin@itcommunity.com',
      password: 'SecureAdmin123!',
      name: 'Admin User',
      role: 'ADMIN',
      company: 'ITCommunity',
      location: 'Global',
      bio: 'System Administrator',
      skills: ['Administration', 'Management', 'System Design']
    };

    // Note: This would need to be implemented as an admin endpoint in the backend
    console.log('📋 Admin user data prepared:');
    console.log('  Email:', adminData.email);
    console.log('  Password:', adminData.password);
    console.log('  Name:', adminData.name);
    console.log('  Role:', adminData.role);
    
    console.log('\n🔧 To manually create the admin user:');
    console.log('1. Connect to your database directly (PostgreSQL)');
    console.log('2. Run this SQL query:');
    
    const hashedPassword = await bcrypt.hash(adminData.password, 12);
    const sql = `
INSERT INTO "User" (id, email, password, name, role, company, location, bio, skills, "createdAt", "updatedAt")
VALUES (
  'admin-user-' || gen_random_uuid(),
  '${adminData.email}',
  '${hashedPassword}',
  '${adminData.name}',
  '${adminData.role}',
  '${adminData.company}',
  '${adminData.location}',
  '${adminData.bio}',
  ARRAY['${adminData.skills.join("', '")}'],
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;`;

    console.log(sql);
    
    console.log('\n✅ After running the SQL, you can login with:');
    console.log('  Email: admin@itcommunity.com');
    console.log('  Password: SecureAdmin123!');

  } catch (error) {
    console.error('❌ Error preparing admin user data:', error);
  }
}

createAdminViaAPI(); 