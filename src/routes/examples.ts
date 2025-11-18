import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/db';
import { CreateExampleSchema } from '../types';

export async function exampleRoutes(fastify: FastifyInstance) {
  // List examples for a dataset
  fastify.get(
    '/datasets/:datasetId/examples',
    async (
      request: FastifyRequest<{
        Params: { datasetId: string };
        Querystring: { limit?: string; offset?: string };
      }>,
      reply: FastifyReply
    ) => {
      const { datasetId } = request.params;
      const limit = parseInt(request.query.limit || '50', 10);
      const offset = parseInt(request.query.offset || '0', 10);

      const examples = await prisma.example.findMany({
        where: { sourceDatasetId: datasetId },
        orderBy: { createdAt: 'asc' },
        take: limit,
        skip: offset,
      });

      const total = await prisma.example.count({
        where: { sourceDatasetId: datasetId },
      });

      return { examples, total, limit, offset };
    }
  );

  // Get single example
  fastify.get(
    '/examples/:id',
    async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      const { id } = request.params;

      const example = await prisma.example.findUnique({
        where: { id },
      });

      if (!example) {
        return reply.status(404).send({ error: 'Example not found' });
      }

      return { example };
    }
  );

  // Create example
  fastify.post('/examples', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = CreateExampleSchema.parse(request.body);

      const example = await prisma.example.create({
        data,
      });

      return reply.status(201).send({ example });
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  });

  // Update example
  fastify.patch(
    '/examples/:id',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const { id } = request.params;
      const updates = request.body as any;

      try {
        const example = await prisma.example.update({
          where: { id },
          data: updates,
        });

        return { example };
      } catch (error) {
        return reply.status(404).send({ error: 'Example not found' });
      }
    }
  );

  // Delete example
  fastify.delete(
    '/examples/:id',
    async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      const { id } = request.params;

      try {
        await prisma.example.delete({
          where: { id },
        });

        return { success: true };
      } catch (error) {
        return reply.status(404).send({ error: 'Example not found' });
      }
    }
  );
}
