// Spec OpenAPI (export JSON)
const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'MyContacts API',
    version: '1.0.0',
    description: 'Auth JWT + CRUD Contacts'
  },
  servers: [
    { url: 'http://localhost:4000', description: 'Local dev' }
    // { url: 'https://<ton-backend>.onrender.com', description: 'Production' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string', format: 'email' },
          createdAt: { type: 'string', format: 'date-time' }
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
      }
    }
  },
  security: [],
  paths: {
    '/health': {
      get: { summary: 'Healthcheck', responses: { 200: { description: 'OK' } } }
    },
    '/auth/register': {
      post: {
        summary: 'Register',
        requestBody: { required: true, content: { 'application/json': { schema: {
          type: 'object', required: ['email','password'],
          properties: { email: {type:'string'}, password:{type:'string'} }
        }}}},
        responses: { 201: { description: 'Created' }, 409: { description: 'Conflict' } }
      }
    },
    '/auth/login': {
      post: {
        summary: 'Login',
        requestBody: { required: true, content: { 'application/json': { schema: {
          type: 'object', required: ['email','password'],
          properties: { email: {type:'string'}, password:{type:'string'} }
        }}}},
        responses: { 200: { description: 'OK' }, 401: { description: 'Unauthorized' } }
      }
    },
    '/me': {
      get: {
        summary: 'Current user',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'OK' }, 401: { description: 'Unauthorized' } }
      }
    },
    '/contacts': {
      get: {
        summary: 'List contacts',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'q', in: 'query', schema: { type: 'string' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'offset', in: 'query', schema: { type: 'integer' } }
        ],
        responses: { 200: { description: 'OK' }, 401: { description: 'Unauthorized' } }
      },
      post: {
        summary: 'Create contact',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: {
          type: 'object', required: ['firstName','lastName','phone'],
          properties: {
            firstName: {type:'string'}, lastName:{type:'string'}, phone:{type:'string'}
          }
        }}}},
        responses: { 201: { description: 'Created' }, 400: { description: 'Bad Request' }, 401: { description: 'Unauthorized' } }
      }
    },
    '/contacts/{id}': {
      patch: {
        summary: 'Update contact',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { content: { 'application/json': { schema: {
          type: 'object',
          properties: { firstName:{type:'string'}, lastName:{type:'string'}, phone:{type:'string'} }
        }}}},
        responses: { 200: { description: 'OK' }, 400: { description: 'Bad Request' }, 401: { description: 'Unauthorized' }, 404: { description: 'Not Found' } }
      },
      delete: {
        summary: 'Delete contact',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 204: { description: 'No Content' }, 400: { description: 'Bad Request' }, 401: { description: 'Unauthorized' }, 404: { description: 'Not Found' } }
      }
    },
    '/contacts/bulk': {
      patch: {
        summary: 'Bulk update contacts',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: {
          type: 'array',
          items: {
            type: 'object',
            required: ['id','patch'],
            properties: {
              id: { type: 'string' },
              patch: {
                type: 'object',
                properties: { firstName:{type:'string'}, lastName:{type:'string'}, phone:{type:'string'} }
              }
            }
          }
        }}}},
        responses: { 200: { description: 'OK' }, 400: { description: 'Bad Request' }, 401: { description: 'Unauthorized' } }
      }
    }
  }
};
module.exports = swaggerSpec;
