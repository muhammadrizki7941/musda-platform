// Simple test untuk participants API
fetch('http://localhost:3001/api/participants')
  .then(response => response.json())
  .then(data => {
    console.log('✅ API Response:', data);
    if (Array.isArray(data)) {
      console.log(`📊 Total participants: ${data.length}`);
      if (data.length > 0) {
        console.log('📋 Sample data:', data[0]);
      }
    }
  })
  .catch(error => {
    console.error('❌ API Error:', error);
  });