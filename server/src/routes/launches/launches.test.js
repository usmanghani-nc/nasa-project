const request = require('supertest');
const app = require('../../app');
const { loadPlanetsData } = require('../../models/planets.model');

const { mongoConnect, mongoDisconnect } = require('../../services/mongo');

describe('Launches API', () => {
  beforeAll(async () => {
    await mongoConnect();
    await loadPlanetsData();
  });

  afterAll(async () => {
    await mongoDisconnect();
  });

  describe('Test GET /lauches', () => {
    test('It should respond with 200 success', async () => {
      await request(app).get('/v1/launches').expect('Content-type', /json/).expect(200);
    });
  });

  describe('Test POST /lauches', () => {
    const completeLaunchData = {
      mission: 'Kepler Exploration X',
      target: 'Kepler-296 A e',
      rocket: 'Explorer IS1',
      launchDate: 'December 27, 2030',
    };

    const launchDateWithoutDate = {
      mission: 'Kepler Exploration X',
      target: 'Kepler-296 A e',
      rocket: 'Explorer IS1',
    };

    const launchDataWithInvalidDate = {
      mission: 'Kepler Exploration X',
      target: 'Kepler-296 A e',
      rocket: 'Explorer IS1',
      launchDate: 'zootopia',
    };

    test('It should respond with 201 success', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(completeLaunchData)
        .expect('Content-type', /json/)
        .expect(201);

      const requestDate = new Date(completeLaunchData.launchDate).valueOf();
      const responsetDate = new Date(response.body.launchDate).valueOf();
      expect(responsetDate).toBe(requestDate);
      expect(response.body).toMatchObject(launchDateWithoutDate);
    });

    test('It should catch missing required properties', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(launchDateWithoutDate)
        .expect('Content-type', /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: 'Missing required launch property',
      });
    });

    test('It should catch invalid dates', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(launchDataWithInvalidDate)
        .expect('Content-type', /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: 'Invalid launch date',
      });
    });
  });
});
