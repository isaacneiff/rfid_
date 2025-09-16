// src/app/api/scan/route.ts
import { NextResponse } from 'next/server';
import { checkAccess } from '@/lib/actions';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cardUID } = body;

    if (!cardUID) {
      return NextResponse.json({ error: 'Card UID is required' }, { status: 400 });
    }

    // A action 'checkAccess' agora só precisa do cardUID
    const result = await checkAccess({ cardUID });

    // Retorna o resultado da verificação de acesso para o script intermediário
    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error('API Scan Error:', error);
    if (error instanceof SyntaxError) { // JSON parsing error
        return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
