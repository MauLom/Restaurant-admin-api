#!/usr/bin/env node

/**
 * Load Testing Script
 * 
 * This script performs basic load testing on the Restaurant Management API
 * to validate performance under concurrent requests.
 */

const http = require('http');
const https = require('https');

const config = {
  host: process.env.API_HOST || 'localhost',
  port: process.env.API_PORT || '5000',
  protocol: process.env.API_PROTOCOL || 'http',
  concurrent: parseInt(process.env.CONCURRENT_USERS) || 10,
  requests: parseInt(process.env.TOTAL_REQUESTS) || 100,
  timeout: 30000
};

const baseUrl = `${config.protocol}://${config.host}:${config.port}`;

// Test endpoints with different load characteristics
const testEndpoints = [
  {
    name: 'Light Load - Health Check',
    path: '/api/users/exists',
    method: 'GET',
    weight: 0.4 // 40% of requests
  },
  {
    name: 'Medium Load - Demo Access',
    path: '/api/users/demo-access',
    method: 'GET',
    weight: 0.3 // 30% of requests
  },
  {
    name: 'Heavy Load - Swagger Docs',
    path: '/api-docs/',
    method: 'GET',
    weight: 0.2 // 20% of requests
  },
  {
    name: 'Authentication Test',
    path: '/api/users/profile',
    method: 'GET',
    weight: 0.1 // 10% of requests
  }
];

// Performance metrics
const metrics = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  totalResponseTime: 0,
  minResponseTime: Infinity,
  maxResponseTime: 0,
  responseTimes: [],
  statusCodes: {},
  errors: []
};

// HTTP request helper
function makeRequest(options) {
  return new Promise((resolve) => {
    const startTime = Date.now();
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
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        resolve({
          success: true,
          statusCode: res.statusCode,
          responseTime: responseTime,
          size: data.length
        });
      });
    });

    req.on('error', (error) => {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      resolve({
        success: false,
        error: error.message,
        responseTime: responseTime
      });
    });

    req.on('timeout', () => {
      req.destroy();
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      resolve({
        success: false,
        error: 'Request timeout',
        responseTime: responseTime
      });
    });

    req.end();
  });
}

// Select endpoint based on weight distribution
function selectEndpoint() {
  const random = Math.random();
  let cumulative = 0;
  
  for (const endpoint of testEndpoints) {
    cumulative += endpoint.weight;
    if (random <= cumulative) {
      return endpoint;
    }
  }
  
  return testEndpoints[0]; // fallback
}

// Single request execution
async function executeRequest() {
  const endpoint = selectEndpoint();
  
  const options = {
    protocol: config.protocol,
    hostname: config.host,
    port: config.port,
    path: endpoint.path,
    method: endpoint.method
  };

  const result = await makeRequest(options);
  
  // Update metrics
  metrics.totalRequests++;
  metrics.totalResponseTime += result.responseTime;
  metrics.responseTimes.push(result.responseTime);
  
  if (result.responseTime < metrics.minResponseTime) {
    metrics.minResponseTime = result.responseTime;
  }
  
  if (result.responseTime > metrics.maxResponseTime) {
    metrics.maxResponseTime = result.responseTime;
  }
  
  if (result.success) {
    metrics.successfulRequests++;
    
    if (!metrics.statusCodes[result.statusCode]) {
      metrics.statusCodes[result.statusCode] = 0;
    }
    metrics.statusCodes[result.statusCode]++;
  } else {
    metrics.failedRequests++;
    metrics.errors.push({
      endpoint: endpoint.name,
      error: result.error,
      responseTime: result.responseTime
    });
  }
  
  return result;
}

// Worker function for concurrent execution
async function worker(workerId, requestsPerWorker) {
  console.log(`Worker ${workerId} starting with ${requestsPerWorker} requests`);
  
  for (let i = 0; i < requestsPerWorker; i++) {
    await executeRequest();
    
    // Small delay to prevent overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  
  console.log(`Worker ${workerId} completed`);
}

// Calculate percentiles
function calculatePercentile(arr, percentile) {
  const sorted = arr.slice().sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[index];
}

// Display results
function displayResults() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 LOAD TEST RESULTS');
  console.log('='.repeat(60));
  
  console.log('\n📈 Request Statistics:');
  console.log(`Total Requests: ${metrics.totalRequests}`);
  console.log(`Successful: ${metrics.successfulRequests} (${((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(2)}%)`);
  console.log(`Failed: ${metrics.failedRequests} (${((metrics.failedRequests / metrics.totalRequests) * 100).toFixed(2)}%)`);
  
  console.log('\n⏱️  Response Time Statistics (ms):');
  const avgResponseTime = metrics.totalResponseTime / metrics.totalRequests;
  console.log(`Average: ${avgResponseTime.toFixed(2)}`);
  console.log(`Minimum: ${metrics.minResponseTime}`);
  console.log(`Maximum: ${metrics.maxResponseTime}`);
  
  if (metrics.responseTimes.length > 0) {
    console.log(`50th Percentile: ${calculatePercentile(metrics.responseTimes, 50)}`);
    console.log(`95th Percentile: ${calculatePercentile(metrics.responseTimes, 95)}`);
    console.log(`99th Percentile: ${calculatePercentile(metrics.responseTimes, 99)}`);
  }
  
  console.log('\n📋 HTTP Status Codes:');
  Object.entries(metrics.statusCodes).forEach(([code, count]) => {
    console.log(`${code}: ${count} requests`);
  });
  
  if (metrics.errors.length > 0) {
    console.log('\n❌ Errors:');
    const errorSummary = {};
    metrics.errors.forEach(error => {
      if (!errorSummary[error.error]) {
        errorSummary[error.error] = 0;
      }
      errorSummary[error.error]++;
    });
    
    Object.entries(errorSummary).forEach(([error, count]) => {
      console.log(`${error}: ${count} occurrences`);
    });
  }
  
  // Performance assessment
  console.log('\n🎯 Performance Assessment:');
  const successRate = (metrics.successfulRequests / metrics.totalRequests) * 100;
  
  if (successRate >= 99) {
    console.log('✅ Excellent - Success rate >= 99%');
  } else if (successRate >= 95) {
    console.log('🟡 Good - Success rate >= 95%');
  } else if (successRate >= 90) {
    console.log('🟠 Fair - Success rate >= 90%');
  } else {
    console.log('🔴 Poor - Success rate < 90%');
  }
  
  if (avgResponseTime <= 100) {
    console.log('✅ Excellent - Average response time <= 100ms');
  } else if (avgResponseTime <= 500) {
    console.log('🟡 Good - Average response time <= 500ms');
  } else if (avgResponseTime <= 1000) {
    console.log('🟠 Fair - Average response time <= 1000ms');
  } else {
    console.log('🔴 Poor - Average response time > 1000ms');
  }
}

// Main load test function
async function runLoadTest() {
  console.log('🔥 Starting Load Test');
  console.log(`Target: ${baseUrl}`);
  console.log(`Concurrent Users: ${config.concurrent}`);
  console.log(`Total Requests: ${config.requests}`);
  console.log('='.repeat(50));
  
  // Wait for server to be ready
  console.log('Checking server availability...');
  try {
    await makeRequest({
      protocol: config.protocol,
      hostname: config.host,
      port: config.port,
      path: '/api/users/exists',
      method: 'GET'
    });
    console.log('✅ Server is ready!');
  } catch (error) {
    console.log('❌ Server is not responding. Load test cannot proceed.');
    process.exit(1);
  }
  
  const startTime = Date.now();
  
  // Distribute requests among workers
  const requestsPerWorker = Math.floor(config.requests / config.concurrent);
  const remainingRequests = config.requests % config.concurrent;
  
  const workers = [];
  
  // Create workers
  for (let i = 0; i < config.concurrent; i++) {
    const workerRequests = requestsPerWorker + (i < remainingRequests ? 1 : 0);
    workers.push(worker(i + 1, workerRequests));
  }
  
  // Wait for all workers to complete
  await Promise.all(workers);
  
  const endTime = Date.now();
  const totalTime = endTime - startTime;
  
  console.log(`\n⏰ Load test completed in ${totalTime}ms`);
  console.log(`📊 Requests per second: ${((config.requests / totalTime) * 1000).toFixed(2)}`);
  
  displayResults();
  
  // Exit with appropriate code
  const successRate = (metrics.successfulRequests / metrics.totalRequests) * 100;
  if (successRate < 95) {
    console.log('\n⚠️  Load test indicates potential performance issues.');
    process.exit(1);
  } else {
    console.log('\n🎉 Load test completed successfully!');
    process.exit(0);
  }
}

// Run the load test
if (require.main === module) {
  runLoadTest().catch(error => {
    console.error('Fatal error during load test:', error);
    process.exit(1);
  });
}

module.exports = { runLoadTest };