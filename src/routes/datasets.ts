import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/db';
import { CreateSourceDatasetSchema } from '../types';

export async function datasetRoutes(fastify: FastifyInstance) {
  // List all datasets
  fastify.get('/datasets', async (request: FastifyRequest, reply: FastifyReply) => {
    const datasets = await prisma.sourceDataset.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { examples: true },
        },
      },
    });

    return { datasets };
  });

  // Get single dataset
  fastify.get(
    '/datasets/:id',
    async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      const { id } = request.params;

      const dataset = await prisma.sourceDataset.findUnique({
        where: { id },
        include: {
          _count: {
            select: { examples: true },
          },
        },
      });

      if (!dataset) {
        return reply.status(404).send({
          error: {
            message: 'Dataset not found',
            code: 'NOT_FOUND',
          },
          timestamp: new Date().toISOString(),
        });
      }

      return { dataset };
    }
  );

  // Create dataset
  fastify.post('/datasets', async (request: FastifyRequest, reply: FastifyReply) => {
    const data = CreateSourceDatasetSchema.parse(request.body);

    const dataset = await prisma.sourceDataset.create({
      data,
    });

    return reply.status(201).send({ dataset });
  });

  // Delete dataset
  fastify.delete(
    '/datasets/:id',
    async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      const { id } = request.params;

      await prisma.sourceDataset.delete({
        where: { id },
      });

      return { success: true };
    }
  );
}
