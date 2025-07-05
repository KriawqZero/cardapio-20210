import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Verificar conexão com banco
    await prisma.$queryRaw`SELECT 1`;
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected',
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0'
    };
    
    return NextResponse.json(health);
  } catch (error) {
    console.error('Health check failed:', error);
    
    const health = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'disconnected',
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    
    return NextResponse.json(health, { status: 503 });
  }
} 