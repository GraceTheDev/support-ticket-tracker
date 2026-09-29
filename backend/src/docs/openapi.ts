/**
 * OpenAPI 3 specification for the Support Ticket Tracker API.
 * Served at GET /api-docs (Swagger UI) and GET /api-docs.json
 */
export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Support Ticket Tracker API',
    version: '1.0.0',
    description:
      'Track support requests from arrival to resolution. No authentication required for this demo.',
  },
  servers: [
    { url: '/', description: 'Current host' },
    { url: 'http://localhost:3000', description: 'Local API' },
  ],
  tags: [
    { name: 'Health', description: 'Service health' },
    { name: 'Tickets', description: 'Ticket CRUD, filters, and workflow' },
  ],
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        operationId: 'getHealth',
        responses: {
          '200': {
            description: 'API is running',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: {
                      type: 'string',
                      example: 'Support Ticket Tracker API is running',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/tickets': {
      get: {
        tags: ['Tickets'],
        summary: 'List tickets',
        description:
          'List tickets with optional title search and status/priority filters.',
        operationId: 'listTickets',
        parameters: [
          {
            name: 'search',
            in: 'query',
            required: false,
            schema: { type: 'string' },
            description: 'Case-insensitive substring match on title',
            example: 'password',
          },
          {
            name: 'status',
            in: 'query',
            required: false,
            schema: {
              type: 'string',
              enum: ['Open', 'In progress', 'Resolved'],
            },
          },
          {
            name: 'priority',
            in: 'query',
            required: false,
            schema: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
            },
          },
        ],
        responses: {
          '200': {
            description: 'Ticket list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    count: { type: 'integer', example: 2 },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Ticket' },
                    },
                  },
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/Error' },
        },
      },
      post: {
        tags: ['Tickets'],
        summary: 'Create ticket',
        operationId: 'createTicket',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateTicketRequest' },
              example: {
                title: 'Cannot reset password',
                description: 'Reset link fails',
                priority: 'high',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Ticket created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Ticket' },
                  },
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/Error' },
        },
      },
    },
    '/api/tickets/summary': {
      get: {
        tags: ['Tickets'],
        summary: 'Ticket summary',
        description: 'Total tickets and counts grouped by status.',
        operationId: 'getTicketSummary',
        responses: {
          '200': {
            description: 'Summary counts',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        total: { type: 'integer', example: 3 },
                        byStatus: {
                          type: 'object',
                          properties: {
                            Open: { type: 'integer', example: 2 },
                            'In progress': { type: 'integer', example: 1 },
                            Resolved: { type: 'integer', example: 0 },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/tickets/{id}': {
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'integer', minimum: 1 },
          description: 'Numeric ticket id',
          example: 1,
        },
      ],
      get: {
        tags: ['Tickets'],
        summary: 'Get ticket by id',
        operationId: 'getTicket',
        responses: {
          '200': {
            description: 'Ticket found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Ticket' },
                  },
                },
              },
            },
          },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
      patch: {
        tags: ['Tickets'],
        summary: 'Update ticket fields',
        description:
          'Partial update of title, description, priority, and/or status. Prefer dedicated status/priority endpoints when a comment is required.',
        operationId: 'updateTicket',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateTicketRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Ticket updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Ticket' },
                  },
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/Error' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        tags: ['Tickets'],
        summary: 'Delete ticket',
        operationId: 'deleteTicket',
        responses: {
          '200': {
            description: 'Ticket deleted',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Ticket deleted' },
                  },
                },
              },
            },
          },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/api/tickets/{id}/status': {
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'integer', minimum: 1 },
          example: 1,
        },
      ],
      patch: {
        tags: ['Tickets'],
        summary: 'Change ticket status',
        description:
          'Move status (Open → In progress → Resolved). Requires a non-empty comment; logs an activity entry.',
        operationId: 'updateTicketStatus',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/StatusUpdateRequest' },
              example: {
                status: 'In progress',
                comment: 'Investigating the issue.',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Status updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Ticket' },
                  },
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/Error' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/api/tickets/{id}/priority': {
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'integer', minimum: 1 },
          example: 1,
        },
      ],
      patch: {
        tags: ['Tickets'],
        summary: 'Change ticket priority',
        description:
          'Agent priority change. Requires a non-empty comment; logs an activity entry.',
        operationId: 'updateTicketPriority',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PriorityUpdateRequest' },
              example: {
                priority: 'high',
                comment: 'Customer blocked; escalating.',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Priority updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Ticket' },
                  },
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/Error' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },
  },
  components: {
    responses: {
      Error: {
        description: 'Validation or request error',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: false },
                errors: {
                  type: 'array',
                  items: { type: 'string' },
                  example: ['Title is required and cannot be empty'],
                },
                error: { type: 'string' },
              },
            },
          },
        },
      },
      NotFound: {
        description: 'Ticket not found',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: false },
                error: { type: 'string', example: 'Ticket not found' },
              },
            },
          },
        },
      },
    },
    schemas: {
      Priority: {
        type: 'string',
        enum: ['low', 'medium', 'high'],
      },
      Status: {
        type: 'string',
        enum: ['Open', 'In progress', 'Resolved'],
      },
      Activity: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          type: {
            type: 'string',
            enum: ['status_change', 'priority_change'],
          },
          fromStatus: { type: 'string' },
          toStatus: { type: 'string' },
          fromPriority: { type: 'string' },
          toPriority: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Ticket: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            description: 'Numeric ticket id',
            example: 1,
          },
          title: { type: 'string', example: 'Cannot reset password' },
          description: { type: 'string', example: 'Reset link fails' },
          priority: { $ref: '#/components/schemas/Priority' },
          status: { $ref: '#/components/schemas/Status' },
          activity: {
            type: 'array',
            items: { $ref: '#/components/schemas/Activity' },
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateTicketRequest: {
        type: 'object',
        required: ['title', 'priority'],
        properties: {
          title: { type: 'string', minLength: 1 },
          description: { type: 'string' },
          priority: { $ref: '#/components/schemas/Priority' },
          status: { $ref: '#/components/schemas/Status' },
        },
      },
      UpdateTicketRequest: {
        type: 'object',
        properties: {
          title: { type: 'string', minLength: 1 },
          description: { type: 'string' },
          priority: { $ref: '#/components/schemas/Priority' },
          status: { $ref: '#/components/schemas/Status' },
        },
      },
      StatusUpdateRequest: {
        type: 'object',
        required: ['status', 'comment'],
        properties: {
          status: { $ref: '#/components/schemas/Status' },
          comment: {
            type: 'string',
            minLength: 1,
            description: 'Required note explaining the status change',
          },
        },
      },
      PriorityUpdateRequest: {
        type: 'object',
        required: ['priority', 'comment'],
        properties: {
          priority: { $ref: '#/components/schemas/Priority' },
          comment: {
            type: 'string',
            minLength: 1,
            description: 'Required note explaining the priority change',
          },
        },
      },
    },
  },
} as const;

// swagger-ui-express expects a mutable plain object
export type OpenApiDocument = typeof openApiSpec;
