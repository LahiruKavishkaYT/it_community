const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testProjectApproval() {
  try {
    console.log('🔍 Testing Project Approval Functionality...\n');

    // 1. Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@itcommunity.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.access_token;
    console.log('✅ Login successful\n');

    // 2. Get projects list
    console.log('2. Fetching projects...');
    const projectsResponse = await axios.get(`${BASE_URL}/admin/projects?page=1&limit=10`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Projects fetched successfully');
    console.log(`📊 Found ${projectsResponse.data.projects.length} projects`);
    
    if (projectsResponse.data.projects.length > 0) {
      const project = projectsResponse.data.projects[0];
      console.log(`📋 Sample project: ${project.title} (ID: ${project.id})`);
      console.log(`📋 Project status: ${project.status}\n`);

      // 3. Test project approval if project is pending approval
      if (project.status === 'PENDING_APPROVAL') {
        console.log('3. Testing project approval...');
        try {
          const approveResponse = await axios.post(`${BASE_URL}/admin/projects/${project.id}/approve`, {
            notes: 'Test approval from admin'
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          console.log('✅ Project approved successfully');
          console.log(`📋 New status: ${approveResponse.data.status}\n`);
        } catch (approveError) {
          console.log('❌ Project approval failed:');
          console.log(`   Status: ${approveError.response?.status}`);
          console.log(`   Message: ${approveError.response?.data?.message || approveError.message}\n`);
        }
      } else {
        console.log('3. Skipping approval test - project is not pending approval\n');
      }

      // 4. Test project details
      console.log('4. Testing project details...');
      try {
        const detailsResponse = await axios.get(`${BASE_URL}/admin/projects/${project.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('✅ Project details fetched successfully');
        console.log(`📋 Project: ${detailsResponse.data.title}`);
        console.log(`📋 Author: ${detailsResponse.data.author.name}`);
        console.log(`📋 Status: ${detailsResponse.data.status}\n`);
      } catch (detailsError) {
        console.log('❌ Project details failed:');
        console.log(`   Status: ${detailsError.response?.status}`);
        console.log(`   Message: ${detailsError.response?.data?.message || detailsError.message}\n`);
      }
    }

    // 5. Test with status filter
    console.log('5. Testing projects with status filter...');
    try {
      const filteredResponse = await axios.get(`${BASE_URL}/admin/projects?status=published&page=1&limit=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Filtered projects fetched successfully');
      console.log(`📊 Found ${filteredResponse.data.projects.length} published projects\n`);
    } catch (filterError) {
      console.log('❌ Status filter failed:');
      console.log(`   Status: ${filterError.response?.status}`);
      console.log(`   Message: ${filterError.response?.data?.message || filterError.message}\n`);
    }

  } catch (error) {
    console.log('❌ Test failed:');
    console.log(`   Status: ${error.response?.status}`);
    console.log(`   Message: ${error.response?.data?.message || error.message}`);
    console.log(`   URL: ${error.config?.url}`);
  }
}

// Run the test
testProjectApproval(); 