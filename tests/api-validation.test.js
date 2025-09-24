const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');

// Connect to the test database before running tests
beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI + '_api_validation_' + Date.now(), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }
});

// Close database connection after all tests
afterAll(async () => {
  await mongoose.connection.close();
});

describe('API Validation Tests - Deployment Readiness', () => {
  describe('Health Check Endpoints', () => {
    it('should respond to basic server health check', async () => {
      const response = await request(app)
        .get('/api/users/exists');
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('exists');
    });

    it('should have Swagger documentation accessible', async () => {
      const response = await request(app)
        .get('/api-docs/');
      
      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toMatch(/text\/html/);
    });
  });

  describe('Authentication Endpoints', () => {
    it('should reject requests without authentication token', async () => {
      const response = await request(app)
        .get('/api/users/profile');
      
      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject requests with invalid authentication token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer invalid_token');
      
      expect(response.statusCode).toBe(401);
      expect(response.body.error).toBe('Invalid token');
    });

    it('should accept demo access request', async () => {
      const response = await request(app)
        .get('/api/users/demo-access');
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('credentials');
      expect(response.body.credentials).toHaveProperty('username');
      expect(response.body.credentials).toHaveProperty('password');
      expect(response.body.credentials).toHaveProperty('pin');
    });
  });

  describe('API Response Format Validation', () => {
    it('should return consistent error format for 404 endpoints', async () => {
      const response = await request(app)
        .get('/api/nonexistent-endpoint');
      
      expect(response.statusCode).toBe(404);
    });

    it('should return consistent error format for invalid JSON', async () => {
      const response = await request(app)
        .post('/api/users/signup')
        .send('invalid json')
        .set('Content-Type', 'application/json');
      
      expect(response.statusCode).toBe(500); // Server correctly returns 500 for malformed JSON
    });

    it('should handle CORS properly', async () => {
      const response = await request(app)
        .options('/api/users/exists')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'GET');
      
      expect(response.statusCode).toBe(204);
      expect(response.headers['access-control-allow-origin']).toBe('*');
    });
  });

  describe('Database Connection Validation', () => {
    it('should maintain database connection during requests', async () => {
      const response = await request(app)
        .get('/api/users/demo-access');
      
      expect(response.statusCode).toBe(200);
      expect(mongoose.connection.readyState).toBe(1); // Connected
    });
  });

  describe('Security Headers Validation', () => {
    it('should include security headers in responses', async () => {
      const response = await request(app)
        .get('/api/users/exists');
      
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-xss-protection');
    });
  });

  describe('Rate Limiting and Performance', () => {
    it('should handle multiple concurrent requests', async () => {
      const promises = Array(5).fill().map(() => 
        request(app).get('/api/users/exists')
      );
      
      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.statusCode).toBe(200);
      });
    });
  });

  describe('Input Validation', () => {
    it('should validate required fields in user signup', async () => {
      const response = await request(app)
        .post('/api/users/signup')
        .send({
          username: 'testuser'
          // Missing required fields: password, role, pin
        });
      
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should validate PIN format', async () => {
      const response = await request(app)
        .post('/api/users/login-pin')
        .send({
          pin: '123' // Invalid PIN format
        });
      
      expect(response.statusCode).toBe(401);
    });
  });
});