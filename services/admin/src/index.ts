/**
 * Admin Service - Main Entry Point
 * Administrative operations for Shema Music Backend
 * Port: 3002
 */

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { connectRedis, disconnectRedis } from '../../../shared/config/redis'

const app = new Hono()

// Middleware
app.use('*', logger())
app.use('*', prettyJSON())

// CORS Configuration - Production Ready
const corsOrigin = process.env.NODE_ENV === 'development'
  ? '*'
  : (process.env.CORS_ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'])

app.use('*', cors({
  origin: corsOrigin,
  credentials: true,
  allowHeaders: ['Content-Type', 'Authorization', 'X-Service-Name'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  maxAge: 86400,
}))

// Health check endpoint
app.get('/health', (c) => {
  return c.json({
    service: 'admin-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    endpoints: ['users', 'analytics', 'system']
  })
})

// Admin routes - placeholder for now
app.get('/api/admin/users', async (c) => {
  return c.json({
    success: true,
    message: 'Admin users endpoint - Coming soon',
    data: []
  })
})

app.get('/api/admin/analytics', async (c) => {
  return c.json({
    success: true,
    message: 'Admin analytics endpoint - Coming soon',
    data: {}
  })
})

app.get('/api/admin/system', async (c) => {
  return c.json({
    success: true,
    message: 'Admin system endpoint - Coming soon',
    data: {}
  })
})

// 404 handler
app.notFound((c) => {
  return c.json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found'
    }
  }, 404)
})

// Error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err)
  return c.json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    }
  }, 500)
})

// Start server
const PORT = process.env.PORT || 3002

async function start() {
  try {
    // Connect to Redis
    console.log('🔄 Connecting to Redis...')
    await connectRedis()

    console.log(`🚀 Admin Service starting on port ${PORT}...`)
    console.log(`📍 Health check: http://localhost:${PORT}/health`)
    console.log(`� Admin API: http://localhost:${PORT}/api/admin/*`)
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`)

  } catch (error) {
    console.error('❌ Failed to start Admin Service:', error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down Admin Service...')
  await disconnectRedis()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down Admin Service...')
  await disconnectRedis()
  process.exit(0)
})

// Start the service
start()

export default {
  port: PORT,
  fetch: app.fetch
}
