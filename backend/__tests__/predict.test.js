import request from 'supertest';

jest.mock('../src/models/Diagnosis.js', () => {
  const mockSelect = jest.fn().mockResolvedValue([]);
  const mockLimit  = jest.fn().mockReturnValue({ select: mockSelect });
  const mockSkip   = jest.fn().mockReturnValue({ limit: mockLimit });
  const mockSort   = jest.fn().mockReturnValue({ skip: mockSkip });
  const mockFind   = jest.fn().mockReturnValue({ sort: mockSort });
  const mockCount  = jest.fn().mockResolvedValue(0);

  return {
    __esModule: true,
    default: { find: mockFind, countDocuments: mockCount },
  };
});

import app from '../src/app.js';

describe('GET /api/health', () => {
  test('returns status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('POST /api/predict', () => {
  test('returns 400 if no image provided', async () => {
    const res = await request(app).post('/api/predict');
    expect(res.statusCode).toBe(400);
    expect(res.body.error.code).toBe('MISSING_IMAGE');
  });

  test('returns 400 if file is not an image', async () => {
    const res = await request(app)
      .post('/api/predict')
      .attach('image', Buffer.from('not an image'), { filename: 'test.txt', contentType: 'text/plain' });
    expect(res.statusCode).toBe(400);
  });
});

describe('GET /api/history', () => {
  test('returns paginated data', async () => {
    const res = await request(app).get('/api/history');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('page');
  });
});