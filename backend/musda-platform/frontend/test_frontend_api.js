import { getApiUrl, apiCall, getFileUrl, API_BASE_URL } from './src/config/api.js';

// Simple test script for frontend API configuration
console.log('🧪 Testing Frontend API Configuration...');

// Test 1: Environment Detection
console.log('\n📍 Test 1: Environment Detection');
console.log('Current hostname:', window.location.hostname);
console.log('API_BASE_URL:', API_BASE_URL);

// Test 2: getApiUrl function
console.log('\n🔗 Test 2: getApiUrl Function');
const testEndpoints = ['/health', '/sponsors', '/agendas', '/sph-settings'];
testEndpoints.forEach(endpoint => {
    console.log(`${endpoint} -> ${getApiUrl(endpoint)}`);
});

// Test 3: getFileUrl function
console.log('\n📁 Test 3: getFileUrl Function');
const testFiles = ['/uploads/test.jpg', 'http://example.com/image.jpg', ''];
testFiles.forEach(file => {
    console.log(`${file} -> ${getFileUrl(file)}`);
});

// Test 4: apiCall function
console.log('\n🌐 Test 4: apiCall Function');
async function testApiCall() {
    try {
        const result = await apiCall('/health');
        console.log('✅ apiCall test success:', result);
    } catch (error) {
        console.log('❌ apiCall test failed:', error.message);
    }
}

// Export test function for browser console
window.testFrontendApi = testApiCall;

console.log('\n🎯 Frontend API Config Test Complete!');
console.log('Run testFrontendApi() in browser console to test API calls');