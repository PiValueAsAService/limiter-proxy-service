import Fastify from 'fastify'
import 'dotenv/config'
import got from 'got'
import url from 'url';
import { collectDefaultMetrics, register } from 'prom-client';

const config = {
    listen: {
        host: process.env.SERVER__LISTEN__HOST,
        api: process.env.SERVER__LISTEN__API
    },
    computeService: {
        protocol: process.env.COMPUTE_SERVICE__PROTOCOL,
        hostname: process.env.COMPUTE_SERVICE__HOSTNAME,
        port: process.env.COMPUTE_SERVICE__PORT,
        timeout: {
            lookup: parseInt(process.env.COMPUTE_SERVICE__TIMEOUT__LOOKUP),
            connect: parseInt(process.env.COMPUTE_SERVICE__TIMEOUT__CONNECT),
            request: parseInt(process.env.COMPUTE_SERVICE__TIMEOUT__REQUEST)
        }
    }
}

collectDefaultMetrics();

const fastify = Fastify({
    logger: true
})

fastify.get(
    '/api/v1/pi',
    {
        schema: {
            querystring: {
                type: 'object',
                properties: {
                    size: {
                        type: 'integer',
                        minimum: 1,
                        maximum: 100000,
                    }
                },
                required: ['size']
            }
        },
        handler: async (request, reply) => {
            reply.type('application/json').code(200)

            const computeServiceUrl = url.format({
                protocol: config.computeService.protocol,
                hostname: config.computeService.hostname,
                port: config.computeService.port,
                pathname: '/api/v1/pi',
                query: { size: request.query.size },
            })

            const result = await got.get(computeServiceUrl, {
                timeout: config.computeService.timeout
            }).json()

            return result
        }
    }
)

fastify.get('/health', async (request, reply) => {
    reply.type('application/json').code(200)
    return { status: 'OK' }
})
fastify.get('/metrics', async (request, reply) => {
    reply.type('application/json').code(200)
    return await register.metrics()
})

fastify.listen({
    host: config.listen.host,
    port: config.listen.api
}, (err) => {
    if (err) throw err
})
