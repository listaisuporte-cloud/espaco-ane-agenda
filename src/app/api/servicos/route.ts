import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Listar todos os serviços
export async function GET() {
  try {
    const servicos = await db.servico.findMany({
      orderBy: { nome: 'asc' }
    });
    return NextResponse.json(servicos);
  } catch (error) {
    console.error('Erro ao buscar serviços:', error);
    return NextResponse.json({ error: 'Erro ao buscar serviços' }, { status: 500 });
  }
}

// POST - Criar novo serviço
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nome, descricao, duracao, valor } = body;

    if (!nome || !duracao || valor === undefined) {
      return NextResponse.json({ 
        error: 'Nome, duração e valor são obrigatórios' 
      }, { status: 400 });
    }

    const servico = await db.servico.create({
      data: {
        nome: nome.trim(),
        descricao: descricao?.trim() || null,
        duracao: parseInt(duracao),
        valor: parseFloat(valor),
      }
    });

    return NextResponse.json(servico, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar serviço:', error);
    return NextResponse.json({ error: 'Erro ao criar serviço' }, { status: 500 });
  }
}
