const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function debugProjectStatus() {
  console.log('🔍 Debugging project statuses...\n');

  try {
    // Test 1: Get all projects without status filter
    console.log('1. Getting all projects...');
    const allProjectsResponse = await axios.get(`${BASE_URL}/admin/projects`, {
      headers: {
        'Authorization': 'Bearer test-token' // This will fail auth, but we can see the response
      }
    });
    
    console.log('✅ All projects endpoint accessible');
    console.log(`📋 Total projects: ${allProjectsResponse.data.projects?.length || 0}`);
    
    if (allProjectsResponse.data.projects?.length > 0) {
      console.log('\n📋 Project statuses:');
      allProjectsResponse.data.projects.forEach((project, index) => {
        console.log(`   ${index + 1}. ${project.title} - Status: ${project.status} (ID: ${project.id})`);
      });
    }
    
  } catch (error) {
    console.log('❌ All projects test failed:');
    console.log(`   Status: ${error.response?.status}`);
    console.log(`   Message: ${error.response?.data?.message || error.message}`);
  }

  try {
    // Test 2: Get projects with 'pending' status filter
    console.log('\n2. Getting projects with "pending" status filter...');
    const pendingProjectsResponse = await axios.get(`${BASE_URL}/admin/projects?status=pending`, {
      headers: {
        'Authorization': 'Bearer test-token'
      }
    });
    
    console.log('✅ Pending projects endpoint accessible');
    console.log(`📋 Pending projects: ${pendingProjectsResponse.data.projects?.length || 0}`);
    
    if (pendingProjectsResponse.data.projects?.length > 0) {
      console.log('\n📋 Pending projects:');
      pendingProjectsResponse.data.projects.forEach((project, index) => {
        console.log(`   ${index + 1}. ${project.title} - Status: ${project.status} (ID: ${project.id})`);
      });
    }
    
  } catch (error) {
    console.log('❌ Pending projects test failed:');
    console.log(`   Status: ${error.response?.status}`);
    console.log(`   Message: ${error.response?.data?.message || error.message}`);
  }

  try {
    // Test 3: Get projects with 'PENDING_APPROVAL' status filter (uppercase)
    console.log('\n3. Getting projects with "PENDING_APPROVAL" status filter...');
    const pendingApprovalProjectsResponse = await axios.get(`${BASE_URL}/admin/projects?status=PENDING_APPROVAL`, {
      headers: {
        'Authorization': 'Bearer test-token'
      }
    });
    
    console.log('✅ PENDING_APPROVAL projects endpoint accessible');
    console.log(`📋 PENDING_APPROVAL projects: ${pendingApprovalProjectsResponse.data.projects?.length || 0}`);
    
    if (pendingApprovalProjectsResponse.data.projects?.length > 0) {
      console.log('\n📋 PENDING_APPROVAL projects:');
      pendingApprovalProjectsResponse.data.projects.forEach((project, index) => {
        console.log(`   ${index + 1}. ${project.title} - Status: ${project.status} (ID: ${project.id})`);
      });
    }
    
  } catch (error) {
    console.log('❌ PENDING_APPROVAL projects test failed:');
    console.log(`   Status: ${error.response?.status}`);
    console.log(`   Message: ${error.response?.data?.message || error.message}`);
  }

  console.log('\n📋 Summary:');
  console.log('   - The backend expects lowercase status values in the mapProjectStatus method');
  console.log('   - Frontend should send "pending" instead of "PENDING_APPROVAL"');
  console.log('   - This should fix the "Project is not pending approval" error');
}

debugProjectStatus().catch(console.error); 