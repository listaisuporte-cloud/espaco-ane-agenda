import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Listar todos os clientes
export async function GET() {
  try {
    const clientes = await db.cliente.findMany({
      orderBy: { nome: 'asc' },
      include: {
        _count: {
          select: { agendamentos: true }
        }
      }
    });
    return NextResponse.json(clientes);
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    return NextResponse.json({ error: 'Erro ao buscar clientes' }, { status: 500 });
  }
}

// POST - Criar novo cliente
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nome, telefone, email, observacoes } = body;

    if (!nome || nome.trim() === '') {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
    }

    const cliente = await db.cliente.create({
      data: {
        nome: nome.trim(),
        telefone: telefone?.trim() || null,
        email: email?.trim() || null,
        observacoes: observacoes?.trim() || null,
      }
    });

    return NextResponse.json(cliente, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    return NextResponse.json({ error: 'Erro ao criar cliente' }, { status: 500 });
  }
}
