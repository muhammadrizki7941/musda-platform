const axios = require('axios');

async function testRegistration() {
  try {
    console.log('🔍 Testing guest registration...');
    
    const testData = {
      nama: 'Test User',
      email: 'test@example.com',
      whatsapp: '081234567890',
      instansi: 'Test Company'
    };
    
    const response = await axios.post('http://localhost:3001/api/register', testData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Registration berhasil!');
    console.log('Response:', response.data);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    process.exit(1);
  }
}

testRegistration();