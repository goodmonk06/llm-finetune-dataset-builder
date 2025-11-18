import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/db';
import { exportService } from '../services/export.service';
import { CreateExportSchema, ExportFormat } from '../types';

export async function exportRoutes(fastify: FastifyInstance) {
  // List all exports
  fastify.get('/exports', async (request: FastifyRequest, reply: FastifyReply) => {
    const exports = await prisma.datasetExport.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return { exports };
  });

  // Get single export
  fastify.get(
    '/exports/:id',
    async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      const { id } = request.params;

      const exportRecord = await prisma.datasetExport.findUnique({
        where: { id },
      });

      if (!exportRecord) {
        return reply.status(404).send({
          error: {
            message: 'Export not found',
            code: 'NOT_FOUND',
          },
          timestamp: new Date().toISOString(),
        });
      }

      return { export: exportRecord };
    }
  );

  // Create export
  fastify.post('/exports', async (request: FastifyRequest, reply: FastifyReply) => {
    const data = CreateExportSchema.parse(request.body);

    // Export each dataset
    const filePaths: string[] = [];
    for (const sourceId of data.sourceIds) {
      const filePath = await exportService.exportDataset(
        sourceId,
        data.format as ExportFormat
      );
      filePaths.push(filePath);
    }

    // Save export record
    const exportRecord = await prisma.datasetExport.create({
      data: {
        name: data.name,
        sourceIds: data.sourceIds,
        format: data.format,
        filePath: filePaths.join(', '),
      },
    });

    return reply.status(201).send({ export: exportRecord, filePaths });
  });
}
