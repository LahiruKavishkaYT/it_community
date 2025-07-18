const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

// Test CUID validation
async function testCuidValidation() {
  console.log('🧪 Testing CUID validation...\n');

  // Test with a valid CUID format (this is what the error showed)
  const validCuid = 'cmchbf38q0001i7nsx618kdn8';
  
  // Test with an invalid UUID format
  const invalidUuid = '123e4567-e89b-12d3-a456-426614174000';
  
  // Test with a completely invalid format
  const invalidFormat = 'invalid-id';

  console.log('1. Testing valid CUID format...');
  console.log(`   CUID: ${validCuid}`);
  console.log(`   Pattern: ${/^c[a-z0-9]{24}$/.test(validCuid) ? '✅ Valid' : '❌ Invalid'}\n`);

  console.log('2. Testing invalid UUID format...');
  console.log(`   UUID: ${invalidUuid}`);
  console.log(`   Pattern: ${/^c[a-z0-9]{24}$/.test(invalidUuid) ? '✅ Valid' : '❌ Invalid'}\n`);

  console.log('3. Testing invalid format...');
  console.log(`   Format: ${invalidFormat}`);
  console.log(`   Pattern: ${/^c[a-z0-9]{24}$/.test(invalidFormat) ? '✅ Valid' : '❌ Invalid'}\n`);

  console.log('📋 Summary:');
  console.log('   - Valid CUIDs should start with "c" followed by 24 alphanumeric characters');
  console.log('   - The pattern /^c[a-z0-9]{24}$/ should match valid CUIDs');
  console.log('   - UUIDs and other formats should not match this pattern');
}

// Test the actual API endpoint (if server is running)
async function testApiEndpoint() {
  console.log('\n🌐 Testing API endpoint...\n');

  try {
    // First, try to get a list of projects to see if any exist
    const projectsResponse = await axios.get(`${BASE_URL}/admin/projects?status=PENDING_APPROVAL`, {
      headers: {
        'Authorization': 'Bearer test-token' // This will fail auth, but we can see the response
      }
    });
    
    console.log('✅ Projects endpoint is accessible');
    console.log(`📋 Found ${projectsResponse.data.projects?.length || 0} pending projects`);
    
    if (projectsResponse.data.projects?.length > 0) {
      const project = projectsResponse.data.projects[0];
      console.log(`📋 Sample project ID: ${project.id}`);
      console.log(`📋 Project title: ${project.title}`);
    }
    
  } catch (error) {
    console.log('❌ API test failed:');
    console.log(`   Status: ${error.response?.status}`);
    console.log(`   Message: ${error.response?.data?.message || error.message}`);
    
    if (error.response?.status === 401) {
      console.log('   Note: This is expected - authentication is required');
    }
  }
}

// Run tests
async function runTests() {
  await testCuidValidation();
  await testApiEndpoint();
}

runTests().catch(console.error); 