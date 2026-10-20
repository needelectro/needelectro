import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 10;

/**
 * Health Check Endpoint
 * Returns service availability and timestamp
 */
export async function GET(_request: NextRequest) {
  const timestamp = new Date().toISOString();

  return NextResponse.json(
    {
      status: 'ok',
      service: 'need-electro-api',
      timestamp,
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}
