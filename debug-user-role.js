// Debug script to check user role - paste this in browser console
async function debugUserRole() {
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.log('❌ No token found in localStorage');
    return;
  }
  
  console.log('🔑 Token found, length:', token.length);
  
  try {
    const response = await fetch('http://localhost:3001/jobs/debug/user-role', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📡 Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ User debug data:', data);
      
      if (data.canCreateJobs) {
        console.log('✅ User CAN create jobs');
      } else {
        console.log('❌ User CANNOT create jobs');
        console.log('   Current role:', data.user?.role);
        console.log('   Required roles:', data.allowedRoles);
      }
    } else {
      const errorText = await response.text();
      console.log('❌ Request failed:', errorText);
    }
  } catch (error) {
    console.log('❌ Network error:', error);
  }
}

// Run the debug function
debugUserRole(); 