const http = require('http');

const API_BASE = 'http://localhost:3001';

// Simple HTTP request function
function makeRequest(method, url, data = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        
        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port || 80,
            path: urlObj.pathname + urlObj.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };
        
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(body);
                    resolve({ status: res.statusCode, data: jsonData });
                } catch {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });
        
        req.on('error', reject);
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function testAPIs() {
    try {
        console.log('🚀 Testing MUSDA Admin APIs...\n');
        
        // Test 1: Health Check
        console.log('1️⃣ Testing Health Check...');
        const health = await makeRequest('GET', `${API_BASE}/api`);
        console.log('✅ Health Check:', health.data);
        console.log('');
        
        // Test 2: Test System Settings without auth first
        console.log('2️⃣ Testing System Settings (no auth)...');
        const systemTest = await makeRequest('GET', `${API_BASE}/api/system/settings`);
        console.log('System Settings Response:', systemTest.status, systemTest.data);
        console.log('');
        
        // Test 3: Test Content API without auth
        console.log('3️⃣ Testing Content API (no auth)...');
        const contentTest = await makeRequest('GET', `${API_BASE}/api/content`);
        console.log('Content API Response:', contentTest.status, contentTest.data);
        console.log('');
        
        // Test 4: Test Reports API without auth
        console.log('4️⃣ Testing Reports API (no auth)...');
        const reportsTest = await makeRequest('GET', `${API_BASE}/api/reports/stats`);
        console.log('Reports API Response:', reportsTest.status, reportsTest.data);
        console.log('');
        
        // Test 5: Test Profile API without auth
        console.log('5️⃣ Testing Profile API (no auth)...');
        const profileTest = await makeRequest('GET', `${API_BASE}/api/profile`);
        console.log('Profile API Response:', profileTest.status, profileTest.data);
        console.log('');
        
        // Test 6: Test existing APIs
        console.log('6️⃣ Testing Existing APIs...');
        const sponsorsTest = await makeRequest('GET', `${API_BASE}/api/sponsors`);
        console.log('Sponsors API Response:', sponsorsTest.status, 'Items:', sponsorsTest.data?.length || 0);
        
        const agendasTest = await makeRequest('GET', `${API_BASE}/api/agendas`);
        console.log('Agendas API Response:', agendasTest.status, 'Items:', agendasTest.data?.length || 0);
        console.log('');
        
        console.log('🎉 API Testing Complete!');
        
    } catch (error) {
        console.error('💥 Fatal Error:', error.message);
    }
}

testAPIs();