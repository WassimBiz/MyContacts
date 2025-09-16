const port = 4000;

module.exports = {
  openapi: '3.0.0',
  info: {
    title: 'MyContacts API',
    version: '1.0.0',
    description: 'Auth (JWT) + Contacts CRUD'
  },
  servers: [
    { url: `http://localhost:${port}`, description: 'Local dev' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              status: { type: 'integer' },
              details: { nullable: true }
            }
          }
        }
      },
      UserPublic: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string', format: 'email' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      AuthRegisterRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 }
        }
      },
      AuthLoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' }
        }
      },
      AuthLoginResponse: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          user: { $ref: '#/components/schemas/UserPublic' }
        }
      },
      Contact: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          phone: { type: 'string' },
          owner: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      ContactCreate: {
        type: 'object',
        required: ['firstName', 'lastName', 'phone'],
        properties: {
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          phone: { type: 'string', minLength: 10, maxLength: 20 }
        }
      },
      ContactUpdate: {
        type: 'object',
        properties: {
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          phone: { type: 'string', minLength: 10, maxLength: 20 }
        }
      }
    }
  },
  paths: {
    '/health': {
      get: {
        summary: 'Healthcheck',
        responses: {
          200: { description: 'OK' }
        }
      }
    },
    '/auth/register': {
      post: {
        summary: 'Register',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/AuthRegisterRequest' } }
          }
        },
        responses: {
          201: { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/UserPublic' } } } },
          400: { description: 'Bad Request', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          409: { description: 'Conflict', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      }
    },
    '/auth/login': {
      post: {
        summary: 'Login',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/AuthLoginRequest' } }
          }
        },
        responses: {
          200: { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthLoginResponse' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      }
    },
    '/me': {
      get: {
        security: [{ bearerAuth: [] }],
        summary: 'Current user',
        responses: {
          200: { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/UserPublic' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      }
    },
    '/contacts': {
      get: {
        security: [{ bearerAuth: [] }],
        summary: 'List contacts',
        parameters: [
          { in: 'query', name: 'q', schema: { type: 'string' } },
          { in: 'query', name: 'limit', schema: { type: 'integer' } },
          { in: 'query', name: 'offset', schema: { type: 'integer' } }
        ],
        responses: {
          200: { description: 'OK' },
          401: { description: 'Unauthorized' }
        }
      },
      post: {
        security: [{ bearerAuth: [] }],
        summary: 'Create contact',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/ContactCreate' } }
          }
        },
        responses: {
          201: { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Contact' } } } },
          400: { description: 'Bad Request' },
          401: { description: 'Unauthorized' }
        }
      }
    },
    '/contacts/{id}': {
      patch: {
        security: [{ bearerAuth: [] }],
        summary: 'Update contact',
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' } }
        ],
        requestBody: {
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ContactUpdate' } } }
        },
        responses: {
          200: { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/Contact' } } } },
          400: { description: 'Bad Request' },
          401: { description: 'Unauthorized' },
          404: { description: 'Not Found' }
        }
      },
      delete: {
        security: [{ bearerAuth: [] }],
        summary: 'Delete contact',
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' } }
        ],
        responses: {
          204: { description: 'No Content' },
          400: { description: 'Bad Request' },
          401: { description: 'Unauthorized' },
          404: { description: 'Not Found' }
        }
      }
    }
  }
};
