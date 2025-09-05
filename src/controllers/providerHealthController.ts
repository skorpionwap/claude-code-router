import { FastifyRequest, FastifyReply } from 'fastify';

const mockProviderHealth = [
  {
    "provider": "OpenAI",
    "status": "online",
    "responseTime": 120,
    "lastCheck": "2025-09-05T17:45:34.783Z"
  },
  {
    "provider": "Anthropic", 
    "status": "degraded",
    "responseTime": 543,
    "lastCheck": "2025-09-05T17:45:34.783Z"
  },
  {
    "provider": "DeepSeek",
    "status": "offline", 
    "responseTime": 0,
    "lastCheck": "2025-09-05T17:45:34.783Z"
  }
];

export const getProviderHealth = async (request: FastifyRequest, reply: FastifyReply) => {
  return mockProviderHealth;
};

export const switchProvider = async (request: FastifyRequest, reply: FastifyReply) => {
  const { provider } = request.body as { provider: string };

  if (!provider) {
    return reply.status(400).send({ message: 'provider is required' });
  }

  // In a real implementation, you would switch the provider here.

  reply.status(200).send({ message: `Switched to provider: ${provider}` });
};
