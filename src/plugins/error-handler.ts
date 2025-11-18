import { FastifyInstance, FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export interface ErrorResponse {
  error: {
    message: string;
    code: string;
    details?: any;
  };
  timestamp: string;
}

export async function errorHandler(fastify: FastifyInstance) {
  fastify.setErrorHandler(
    (error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
      const timestamp = new Date().toISOString();

      // Zod validation errors
      if (error instanceof ZodError) {
        const response: ErrorResponse = {
          error: {
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: error.errors.map((e) => ({
              field: e.path.join('.'),
              message: e.message,
            })),
          },
          timestamp,
        };
        return reply.status(400).send(response);
      }

      // Prisma errors
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        let message = 'Database error';
        let statusCode = 500;

        switch (error.code) {
          case 'P2002':
            message = 'A record with this value already exists';
            statusCode = 409;
            break;
          case 'P2025':
            message = 'Record not found';
            statusCode = 404;
            break;
          case 'P2003':
            message = 'Foreign key constraint failed';
            statusCode = 400;
            break;
        }

        const response: ErrorResponse = {
          error: {
            message,
            code: error.code,
            details: error.meta,
          },
          timestamp,
        };
        return reply.status(statusCode).send(response);
      }

      // Fastify validation errors
      if (error.validation) {
        const response: ErrorResponse = {
          error: {
            message: error.message || 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: error.validation,
          },
          timestamp,
        };
        return reply.status(400).send(response);
      }

      // 404 errors
      if (error.statusCode === 404) {
        const response: ErrorResponse = {
          error: {
            message: error.message || 'Not found',
            code: 'NOT_FOUND',
          },
          timestamp,
        };
        return reply.status(404).send(response);
      }

      // Default error response
      const statusCode = error.statusCode || 500;
      const response: ErrorResponse = {
        error: {
          message: error.message || 'Internal server error',
          code: error.code || 'INTERNAL_ERROR',
        },
        timestamp,
      };

      // Log errors in development
      if (process.env.NODE_ENV !== 'production') {
        fastify.log.error(error);
      }

      return reply.status(statusCode).send(response);
    }
  );
}
