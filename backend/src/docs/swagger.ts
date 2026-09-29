import { Application, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import { openApiSpec } from './openapi';

/** Mount interactive Swagger UI and raw OpenAPI JSON. */
export const setupSwagger = (app: Application): void => {
  app.get('/api-docs.json', (_req: Request, res: Response) => {
    res.json(openApiSpec);
  });

  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(openApiSpec as swaggerUi.JsonObject, {
      customSiteTitle: 'Support Ticket Tracker API',
      swaggerOptions: {
        persistAuthorization: false,
        displayRequestDuration: true,
      },
    })
  );
};
