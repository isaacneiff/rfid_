import { NextResponse } from 'next/server';
import { checkAccess } from '@/lib/actions';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cardUID } = body;

    if (!cardUID) {
      return NextResponse.json({ error: 'UID do cartão é obrigatório' }, { status: 400 });
    }

    const result = await checkAccess({ cardUID });

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error('API Scan Error:', error);
    if (error instanceof SyntaxError) {
        return NextResponse.json({ error: 'JSON inválido no corpo da requisição' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Erro Interno do Servidor' }, { status: 500 });
  }
}
