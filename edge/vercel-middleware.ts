/**
 * Aegis Growth OS — Vercel Edge Middleware Adapter (Next.js Edge Runtime)
 * Zero-CLS (Cumulative Layout Shift) Server-Side HTML & Intent Rewriting for Next.js.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

export function middleware(request: NextRequest) {
  const referrer = request.headers.get('referer') || '';
  const url = request.nextUrl;

  let matchedIntent: string | null = null;
  let customHeading: string | null = null;

  if (referrer.includes('perplexity.ai') || url.searchParams.get('utm_source') === 'perplexity') {
    matchedIntent = 'enterprise_fintech_scalability';
    customHeading = 'The Low-Latency Distributed Database Built for Enterprise Fintech Scaling.';
  } else if (referrer.includes('chatgpt.com') || referrer.includes('openai.com')) {
    matchedIntent = 'cloud_cost_optimization';
    customHeading = 'Cut Cloud Database Infrastructure TCO by 62% Without Sacrificing Performance.';
  } else if (referrer.includes('google.com') && url.searchParams.get('utm_source') === 'google-aio') {
    matchedIntent = 'developer_api_simplicity';
    customHeading = 'Zero-Boilerplate SQL & Vector APIs Built for High-Velocity Product Teams.';
  }

  // Clone response headers
  const response = NextResponse.next();

  if (matchedIntent) {
    // Inject headers for edge personalization without client-side flicker
    response.headers.set('x-aegis-intent', matchedIntent);
    response.headers.set('x-aegis-heading', encodeURIComponent(customHeading || ''));
    response.headers.set('x-aegis-edge-runtime', 'vercel-edge');
  }

  return response;
}
