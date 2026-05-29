const swaggerJsdoc = require('swagger-jsdoc');

const definition = {
  openapi: '3.0.0',
  info: {
    title: 'FutbolApp API - Backend Node (TRWM)',
    version: '1.0.0',
    description: 'API REST para gestión de jugadores y estadísticas de fútbol',
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token de Firebase (idToken)',
      },
    },
    schemas: {
      Player: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          source: { type: 'string', enum: ['api', 'manual'] },
          apiId: { type: 'number' },
          name: { type: 'string' },
          firstname: { type: 'string' },
          lastname: { type: 'string' },
          nationality: { type: 'string' },
          position: { type: 'string' },
          birthDate: { type: 'string' },
          height: { type: 'string' },
          weight: { type: 'string' },
          photo: { type: 'string' },
          team: { type: 'string' },
          league: { type: 'string' },
          location: {
            type: 'object',
            properties: {
              lat: { type: 'number' },
              lng: { type: 'number' },
              address: { type: 'string' },
            },
          },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Comment: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          player: { type: 'string' },
          author: { type: 'string' },
          text: { type: 'string', maxLength: 1000 },
          rating: { type: 'number', minimum: 0, maximum: 5 },
          location: {
            type: 'object',
            properties: {
              lat: { type: 'number' },
              lng: { type: 'number' },
            },
          },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          uid: { type: 'string' },
          email: { type: 'string' },
          displayName: { type: 'string' },
          role: { type: 'string', enum: ['user', 'admin'] },
        },
      },
      IdealTeam: {
        type: 'object',
        properties: {
          formation: { type: 'string', example: '4-3-3' },
          startingXI: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                position: { type: 'string' },
                reason: { type: 'string' },
              },
            },
          },
          substitutes: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                position: { type: 'string' },
                reason: { type: 'string' },
              },
            },
          },
          coach: { type: 'string' },
          summary: { type: 'string' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' },
        },
      },
    },
  },
};

const apis = ['./app_api/routes/*.js'];

function generateSpec(serverUrl) {
  return swaggerJsdoc({
    definition: {
      ...definition,
      servers: [{ url: serverUrl, description: 'Servidor actual' }],
    },
    apis,
  });
}

module.exports = { definition, apis, generateSpec };
