import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Listar agendamentos (com filtros por data)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dataInicio = searchParams.get('dataInicio');
    const dataFim = searchParams.get('dataFim');
    const mes = searchParams.get('mes'); // formato YYYY-MM
    const clienteId = searchParams.get('clienteId');

    const where: {
      data?: { gte?: Date; lte?: Date };
      clienteId?: string;
    } = {};

    if (mes) {
      const [year, month] = mes.split('-').map(Number);
      const inicioMes = new Date(year, month - 1, 1);
      const fimMes = new Date(year, month, 0, 23, 59, 59);
      where.data = { gte: inicioMes, lte: fimMes };
    } else if (dataInicio && dataFim) {
      where.data = {
        gte: new Date(dataInicio),
        lte: new Date(dataFim)
      };
    }

    if (clienteId) {
      where.clienteId = clienteId;
    }

    const agendamentos = await db.agendamento.findMany({
      where,
      include: {
        cliente: true
      },
      orderBy: [
        { data: 'asc' },
        { horaInicio: 'asc' }
      ]
    });

    return NextResponse.json(agendamentos);
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    return NextResponse.json({ error: 'Erro ao buscar agendamentos' }, { status: 500 });
  }
}

// POST - Criar novo agendamento
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clienteId, data, horaInicio, horaFim, servico, valor, status, observacoes } = body;

    if (!clienteId || !data || !horaInicio || !horaFim || !servico) {
      return NextResponse.json({ 
        error: 'Cliente, data, horário e serviço são obrigatórios' 
      }, { status: 400 });
    }

    // Verificar se já existe agendamento no mesmo horário
    const dataAgendamento = new Date(data);
    const agendamentosExistentes = await db.agendamento.findMany({
      where: {
        data: dataAgendamento,
        status: { not: 'cancelado' }
      }
    });

    // Verificar conflito de horário
    const horarioOcupado = agendamentosExistentes.some(ag => {
      return (
        (horaInicio >= ag.horaInicio && horaInicio < ag.horaFim) ||
        (horaFim > ag.horaInicio && horaFim <= ag.horaFim) ||
        (horaInicio <= ag.horaInicio && horaFim >= ag.horaFim)
      );
    });

    if (horarioOcupado) {
      return NextResponse.json({ 
        error: 'Já existe um agendamento neste horário' 
      }, { status: 400 });
    }

    const agendamento = await db.agendamento.create({
      data: {
        clienteId,
        data: dataAgendamento,
        horaInicio,
        horaFim,
        servico,
        valor: valor ? parseFloat(valor) : null,
        status: status || 'agendado',
        observacoes: observacoes?.trim() || null,
      },
      include: {
        cliente: true
      }
    });

    return NextResponse.json(agendamento, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    return NextResponse.json({ error: 'Erro ao criar agendamento' }, { status: 500 });
  }
}
