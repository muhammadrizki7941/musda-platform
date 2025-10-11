const https = require('http');

// Test participants API
const testAPI = () => {
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/participants',
    method: 'GET'
  };

  const req = https.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        console.log('\n=== API RESPONSE ===');
        console.log(JSON.stringify(jsonData, null, 2));
        console.log(`\nTotal participants: ${jsonData.length}`);
      } catch (error) {
        console.log('\n=== RAW RESPONSE ===');
        console.log(data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Request error:', error);
  });

  req.end();
};

console.log('Testing participants API...');
testAPI();