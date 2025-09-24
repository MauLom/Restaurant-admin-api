#!/usr/bin/env node

/**
 * Deployment Test Script
 * 
 * This script validates that the Restaurant Management API is ready for deployment
 * by running a series of health checks and basic functionality tests.
 */

const http = require('http');
const https = require('https');

const config = {
  host: process.env.API_HOST || 'localhost',
  port: process.env.API_PORT || '5000',
  protocol: process.env.API_PROTOCOL || 'http',
  timeout: 10000
};

const baseUrl = `${config.protocol}://${config.host}:${config.port}`;

// Test cases
const tests = [
  {
    name: 'Health Check - User Exists Endpoint',
    method: 'GET',
    path: '/api/users/exists',
    expectedStatus: 200,
    validateResponse: (data) => data.hasOwnProperty('exists')
  },
  {
    name: 'Swagger Documentation Accessibility',
    method: 'GET',
    path: '/api-docs/',
    expectedStatus: 200,
    validateResponse: (data, response) => response.headers['content-type'].includes('text/html')
  },
  {
    name: 'Demo Access Functionality',
    method: 'GET',
    path: '/api/users/demo-access',
    expectedStatus: 200,
    validateResponse: (data) => data.success === true && data.credentials
  },
  {
    name: 'Authentication Rejection',
    method: 'GET',
    path: '/api/users/profile',
    expectedStatus: 401,
    validateResponse: (data) => data.hasOwnProperty('error')
  },
  {
    name: 'CORS Headers Present',
    method: 'OPTIONS',
    path: '/api/users/exists',
    headers: {
      'Origin': 'http://localhost:3000',
      'Access-Control-Request-Method': 'GET'
    },
    expectedStatus: 204,
    validateResponse: (data, response) => response.headers['access-control-allow-origin'] === '*'
  },
  {
    name: 'Security Headers Present',
    method: 'GET',
    path: '/api/users/exists',
    expectedStatus: 200,
    validateResponse: (data, response) => {
      const headers = response.headers;
      return headers['x-content-type-options'] && 
             headers['x-frame-options'] && 
             headers['x-xss-protection'] !== undefined;
    }
  }
];

// HTTP request helper
function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const client = options.protocol === 'https' ? https : http;
    
    const requestOptions = {
      hostname: options.hostname,
      port: options.port,
      path: options.path,
      method: options.method,
      headers: options.headers || {},
      timeout: config.timeout
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = res.headers['content-type']?.includes('application/json') 
            ? JSON.parse(data) 
            : data;
          
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: parsedData
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

// Run a single test
async function runTest(test) {
  console.log(`Running: ${test.name}...`);
  
  try {
    const options = {
      protocol: config.protocol,
      hostname: config.host,
      port: config.port,
      path: test.path,
      method: test.method,
      headers: test.headers
    };

    const response = await makeRequest(options);
    
    // Check status code
    if (response.statusCode !== test.expectedStatus) {
      throw new Error(`Expected status ${test.expectedStatus}, got ${response.statusCode}`);
    }
    
    // Run custom validation if provided
    if (test.validateResponse && !test.validateResponse(response.data, response)) {
      throw new Error('Response validation failed');
    }
    
    console.log(`✅ ${test.name} - PASSED`);
    return true;
    
  } catch (error) {
    console.log(`❌ ${test.name} - FAILED: ${error.message}`);
    return false;
  }
}

// Main test runner
async function runDeploymentTests() {
  console.log('🚀 Starting Deployment Validation Tests');
  console.log(`Target: ${baseUrl}`);
  console.log('=' + '='.repeat(50));
  
  let passed = 0;
  let failed = 0;
  
  // Wait for server to be ready
  console.log('Waiting for server to be ready...');
  let serverReady = false;
  let attempts = 0;
  const maxAttempts = 30;
  
  while (!serverReady && attempts < maxAttempts) {
    try {
      await makeRequest({
        protocol: config.protocol,
        hostname: config.host,
        port: config.port,
        path: '/api/users/exists',
        method: 'GET'
      });
      serverReady = true;
      console.log('✅ Server is ready!');
    } catch (error) {
      attempts++;
      console.log(`Waiting for server... (${attempts}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  if (!serverReady) {
    console.log('❌ Server is not responding. Tests cannot proceed.');
    process.exit(1);
  }
  
  // Run all tests
  for (const test of tests) {
    const result = await runTest(test);
    if (result) {
      passed++;
    } else {
      failed++;
    }
    console.log(''); // Empty line for readability
  }
  
  // Summary
  console.log('=' + '='.repeat(50));
  console.log('📊 Test Results Summary:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📝 Total: ${passed + failed}`);
  
  if (failed > 0) {
    console.log('\n⚠️  Some tests failed. The application may not be ready for deployment.');
    process.exit(1);
  } else {
    console.log('\n🎉 All tests passed! The application appears ready for deployment.');
    process.exit(0);
  }
}

// Additional environment checks
function runEnvironmentChecks() {
  console.log('🔍 Environment Check:');
  console.log(`- Target URL: ${baseUrl}`);
  console.log(`- Node.js Version: ${process.version}`);
  console.log(`- Timeout: ${config.timeout}ms`);
  console.log('');
}

// Run the tests
if (require.main === module) {
  runEnvironmentChecks();
  runDeploymentTests().catch(error => {
    console.error('Fatal error during deployment tests:', error);
    process.exit(1);
  });
}

module.exports = { runDeploymentTests, runTest };