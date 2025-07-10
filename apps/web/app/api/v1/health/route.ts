import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    return new Response(
      JSON.stringify({ status: 'ok', message: 'Health check passed!' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ status: 'error', message: 'Health check failed!' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}