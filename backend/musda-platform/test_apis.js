const https = require('https');
const http = require('http');

const API_BASE = 'http://localhost:3001';

// Simple HTTP request function
function makeRequest(method, url, data = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const isHttps = urlObj.protocol === 'https:';
        
        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port || (isHttps ? 443 : 80),
            path: urlObj.pathname + urlObj.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };
        
        const client = isHttps ? https : http;
        
        const req = client.request(options, (res) => {
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

// Test admin login first to get token
async function loginAndTest() {
    console.log('🧪 Testing New Admin Dashboard APIs\n');
    
    let authToken = null;
    
    try {
        // 1. Login sebagai admin untuk mendapatkan token
        console.log('1️⃣ Testing Admin Login...');
        const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'admin',
                password: 'admin123' // Default admin password
            })
        });
        
        const loginData = await loginResponse.json();
        
        if (loginResponse.ok && loginData.token) {
            authToken = loginData.token;
            console.log('✅ Login successful, token obtained');
        } else {
            console.log('❌ Login failed:', loginData.message);
            // Try creating default admin
            await createDefaultAdmin();
            return;
        }
        
    } catch (error) {
        console.log('❌ Login error:', error.message);
        return;
    }
    
    // Headers dengan authentication
    const authHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    };
    
    console.log('\n2️⃣ Testing System Settings API...');
    try {
        const response = await fetch(`${API_BASE}/api/system/settings`, {
            headers: authHeaders
        });
        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ System Settings:', data.data?.length || 0, 'settings found');
        } else {
            console.log('❌ System Settings failed:', data.message);
        }
    } catch (error) {
        console.log('❌ System Settings error:', error.message);
    }
    
    console.log('\n3️⃣ Testing Content API...');
    try {
        const response = await fetch(`${API_BASE}/api/content`, {
            headers: authHeaders
        });
        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Content Management:', data.data?.length || 0, 'content items found');
        } else {
            console.log('❌ Content Management failed:', data.message);
        }
    } catch (error) {
        console.log('❌ Content Management error:', error.message);
    }
    
    console.log('\n4️⃣ Testing Reports API...');
    try {
        const response = await fetch(`${API_BASE}/api/reports/stats`, {
            headers: authHeaders
        });
        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Reports Stats:', JSON.stringify(data.data, null, 2));
        } else {
            console.log('❌ Reports Stats failed:', data.message);
        }
    } catch (error) {
        console.log('❌ Reports Stats error:', error.message);
    }
    
    console.log('\n5️⃣ Testing Profile API...');
    try {
        const response = await fetch(`${API_BASE}/api/profile`, {
            headers: authHeaders
        });
        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Profile:', data.data?.username || 'No profile data');
        } else {
            console.log('❌ Profile failed:', data.message);
        }
    } catch (error) {
        console.log('❌ Profile error:', error.message);
    }
    
    console.log('\n6️⃣ Testing Existing APIs...');
    try {
        // Test agenda
        const agendaResponse = await fetch(`${API_BASE}/api/agendas`, {
            headers: authHeaders
        });
        const agendaData = await agendaResponse.json();
        
        if (agendaResponse.ok) {
            console.log('✅ Agendas:', agendaData.length || 0, 'agendas found');
        } else {
            console.log('❌ Agendas failed:', agendaData.message);
        }
        
        // Test SPH settings
        const sphResponse = await fetch(`${API_BASE}/api/sph-settings`, {
            headers: authHeaders
        });
        const sphData = await sphResponse.json();
        
        if (sphResponse.ok) {
            console.log('✅ SPH Settings working');
        } else {
            console.log('❌ SPH Settings failed:', sphData.message);
        }
        
    } catch (error) {
        console.log('❌ Existing APIs error:', error.message);
    }
    
    console.log('\n🎉 API Testing Complete!');
}

async function createDefaultAdmin() {
    console.log('\n🔧 Creating default admin user...');
    try {
        const response = await fetch(`${API_BASE}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'admin',
                password: 'admin123',
                email: 'admin@musda.com',
                role: 'admin'
            })
        });
        
        const data = await response.json();
        console.log('Default admin creation result:', data.message);
        
    } catch (error) {
        console.log('❌ Failed to create default admin:', error.message);
    }
}

// Run tests
loginAndTest().catch(console.error);