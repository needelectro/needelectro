import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';
export const maxDuration = 10; // 10s maximum for serverless execution

// Fallback internal token so automation works immediately with 0 manual secret setup
const AUTO_INTERNAL_SECRET = 'ne_live_keepalive_token_2026_moulvibazar';

/**
 * Health Check & Supabase Keep-Alive Endpoint
 *
 * Capabilities:
 * 1. Public ping: Returns non-sensitive service status.
 * 2. Authorized keep-alive: Executes a lightweight, read-only SQL query (`SELECT 1`)
 *    to register PostgreSQL activity on Supabase and keep the project active.
 *
 * Security:
 * - Validates against process.env.CRON_SECRET or AUTO_INTERNAL_SECRET.
 * - Accepts Bearer header, x-cron-secret header, or ?token= query parameter.
 * - Never returns or logs database credentials, connection strings, or user data.
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();

  const authHeader = request.headers.get('authorization');
  const cronSecretHeader = request.headers.get('x-cron-secret');
  const url = new URL(request.url);
  const actionParam = url.searchParams.get('action');
  const tokenParam = url.searchParams.get('token');

  const configuredSecret = process.env.CRON_SECRET || AUTO_INTERNAL_SECRET;

  // Check if keep-alive database ping is requested
  const isKeepAliveRequested =
    actionParam === 'keep-alive' ||
    Boolean(cronSecretHeader) ||
    Boolean(tokenParam);

  // Authorization check for keep-alive operations
  let isAuthorized = false;
  const bearerToken = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : null;

  if (
    (bearerToken && bearerToken === configuredSecret) ||
    (cronSecretHeader && cronSecretHeader === configuredSecret) ||
    (tokenParam && tokenParam === configuredSecret)
  ) {
    isAuthorized = true;
  }

  // If simple health check without keep-alive requested
  if (!isKeepAliveRequested) {
    return NextResponse.json(
      {
        status: 'ok',
        service: 'need-electro-api',
        timestamp,
      },
      { status: 200 }
    );
  }

  // If keep-alive requested but authorization failed
  if (!isAuthorized) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Unauthorized keep-alive request',
        timestamp,
      },
      { status: 401 }
    );
  }

  // Perform minimal, non-mutating database query (SELECT 1)
  try {
    const dbPingPromise = prisma.$queryRawUnsafe('SELECT 1 as ping;');
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('DATABASE_QUERY_TIMEOUT')), 5000)
    );

    // Race against 5-second timeout
    await Promise.race([dbPingPromise, timeoutPromise]);

    const latencyMs = Date.now() - startTime;

    return NextResponse.json(
      {
        status: 'ok',
        database: 'reachable',
        latencyMs,
        timestamp,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error: unknown) {
    const latencyMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Categorize error without exposing raw connection strings
    const errorCategory =
      errorMessage === 'DATABASE_QUERY_TIMEOUT'
        ? 'timeout'
        : 'connection_failure';

    console.error(`[Health Check] Database unreachable (${errorCategory}) after ${latencyMs}ms`);

    // Optional asynchronous alert notification (does not block response)
    const alertWebhookUrl = process.env.ALERT_WEBHOOK_URL;
    if (alertWebhookUrl) {
      fetch(alertWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alert: 'Database Keep-Alive Failed',
          service: 'need-electro',
          category: errorCategory,
          timestamp,
        }),
      }).catch((webhookErr) => {
        console.error('[Health Check] Failed to send alert webhook:', webhookErr?.message || webhookErr);
      });
    }

    return NextResponse.json(
      {
        status: 'degraded',
        database: 'unreachable',
        errorCategory,
        timestamp,
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  }
}
