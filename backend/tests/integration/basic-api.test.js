const request = require('supertest');
const jwt = require('jsonwebtoken');

// Use a test JWT (should match your dev secret and user format)
const TEST_JWT = process.env.TEST_JWT ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijc4YTA2NzVmLTE5ZDAtNDc3YS1hMDFlLTFlMWM5OWE4MzE5NiIsInVzZXJuYW1lIjoiYWxpY2UiLCJob3VzZWhvbGRJZCI6ImhvdXNlMSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQ5MTY3MTY4LCJleHAiOjE3NDkxNzA3Njh9.UeKcAyHR_R4c2QlutR4G7Me9XCL6Vzb6-Phw2bP9Ghk';

describe('BillBuddy API Integration', () => {
  it('should return 200 and health status', async () => {
    const res = await request('http://localhost:3001').get('/healthz');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('should require auth for /api/v1/admin/compliance', async () => {
    const res = await request('http://localhost:3001').get('/api/v1/admin/compliance');
    expect(res.status).toBe(401);
  });

  it('should list compliance statuses with auth', async () => {
    const res = await request('http://localhost:3001')
      .get('/api/v1/admin/compliance')
      .set('Authorization', `Bearer ${TEST_JWT}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should return API docs', async () => {
    // Follow redirect to /api-docs/
    const res = await request('http://localhost:3001').get('/api-docs/');
    expect(res.status).toBe(200);
    expect(res.text).toMatch(/Swagger UI/);
  });

  let testUserToken = null;
  let createdBillId = null;
  let testHouseholdId = null;
  let testUsername = 'testuser_' + Date.now();
  let testPassword = 'testpass123';

  it('should register a new user', async () => {
    const res = await request('http://localhost:3001')
      .post('/api/v1/auth/register')
      .send({ username: testUsername, password: testPassword });
    if (res.status !== 201) {
      console.log('Register user error:', res.body);
    }
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should login and get a JWT', async () => {
    const res = await request('http://localhost:3001')
      .post('/api/v1/auth/login')
      .send({ username: testUsername, password: testPassword });
    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
    testUserToken = res.body.data.token;
  });

  it('should create a household as the user', async () => {
    const res = await request('http://localhost:3001')
      .post('/api/v1/households')
      .set('Authorization', `Bearer ${testUserToken}`)
      .send({ name: 'Test Household ' + Date.now() });
    expect(res.status).toBe(201);
    expect(res.body.data.id).toBeDefined();
    testHouseholdId = res.body.data.id;
  });

  it('should login and get a JWT', async () => {
    const res = await request('http://localhost:3001')
      .post('/api/v1/auth/login')
      .send({ username: testUsername, password: testPassword });
    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
    testUserToken = res.body.data.token;
  });

  it('should create a bill', async () => {
    const res = await request('http://localhost:3001')
      .post('/api/v1/bills')
      .set('Authorization', `Bearer ${testUserToken}`)
      .send({
        householdId: testHouseholdId,
        amount: 123.45,
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        billerName: 'Test Biller',
        category: 'utilities',
        isRecurring: false
      });
    console.log('Create bill response:', res.body);
    expect(res.status).toBe(201);
    expect(res.body.data.id).toBeDefined();
    createdBillId = res.body.data.id;
    console.log('Created bill id:', createdBillId);
  });

  it('should get the created bill', async () => {
    const res = await request('http://localhost:3001')
      .get(`/api/v1/bills/${createdBillId}`)
      .set('Authorization', `Bearer ${testUserToken}`);
    if (res.status !== 200) {
      console.log('Get bill error:', res.body);
    }
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(createdBillId);
  });

  it('should update the bill', async () => {
    const res = await request('http://localhost:3001')
      .put(`/api/v1/bills/${createdBillId}`)
      .set('Authorization', `Bearer ${testUserToken}`)
      .send({ amount: 99.99 });
    expect(res.status).toBe(200);
    expect(res.body.data.amount).toBe(99.99);
  });

  it('should delete the bill', async () => {
    const res = await request('http://localhost:3001')
      .delete(`/api/v1/bills/${createdBillId}`)
      .set('Authorization', `Bearer ${testUserToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(createdBillId);
  });
});
