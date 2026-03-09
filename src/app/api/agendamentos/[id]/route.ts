import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Buscar agendamento por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const agendamento = await db.agendamento.findUnique({
      where: { id },
      include: { cliente: true }
    });

    if (!agendamento) {
      return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 });
    }

    return NextResponse.json(agendamento);
  } catch (error) {
    console.error('Erro ao buscar agendamento:', error);
    return NextResponse.json({ error: 'Erro ao buscar agendamento' }, { status: 500 });
  }
}

// PUT - Atualizar agendamento
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { clienteId, data, horaInicio, horaFim, servico, valor, status, observacoes } = body;

    const updateData: {
      clienteId?: string;
      data?: Date;
      horaInicio?: string;
      horaFim?: string;
      servico?: string;
      valor?: number | null;
      status?: string;
      observacoes?: string | null;
    } = {};

    if (clienteId) updateData.clienteId = clienteId;
    if (data) updateData.data = new Date(data);
    if (horaInicio) updateData.horaInicio = horaInicio;
    if (horaFim) updateData.horaFim = horaFim;
    if (servico) updateData.servico = servico;
    if (valor !== undefined) updateData.valor = valor ? parseFloat(valor) : null;
    if (status) updateData.status = status;
    if (observacoes !== undefined) updateData.observacoes = observacoes?.trim() || null;

    // Verificar conflito de horário se estiver alterando data/hora
    if (updateData.data || updateData.horaInicio || updateData.horaFim) {
      const agendamentoAtual = await db.agendamento.findUnique({
        where: { id }
      });
      
      if (agendamentoAtual) {
        const dataCheck = updateData.data || agendamentoAtual.data;
        const horaInicioCheck = updateData.horaInicio || agendamentoAtual.horaInicio;
        const horaFimCheck = updateData.horaFim || agendamentoAtual.horaFim;

        const agendamentosExistentes = await db.agendamento.findMany({
          where: {
            data: dataCheck,
            status: { not: 'cancelado' },
            id: { not: id }
          }
        });

        const horarioOcupado = agendamentosExistentes.some(ag => {
          return (
            (horaInicioCheck >= ag.horaInicio && horaInicioCheck < ag.horaFim) ||
            (horaFimCheck > ag.horaInicio && horaFimCheck <= ag.horaFim) ||
            (horaInicioCheck <= ag.horaInicio && horaFimCheck >= ag.horaFim)
          );
        });

        if (horarioOcupado) {
          return NextResponse.json({ 
            error: 'Já existe um agendamento neste horário' 
          }, { status: 400 });
        }
      }
    }

    const agendamento = await db.agendamento.update({
      where: { id },
      data: updateData,
      include: { cliente: true }
    });

    return NextResponse.json(agendamento);
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error);
    return NextResponse.json({ error: 'Erro ao atualizar agendamento' }, { status: 500 });
  }
}

// DELETE - Excluir agendamento
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await db.agendamento.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Agendamento excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir agendamento:', error);
    return NextResponse.json({ error: 'Erro ao excluir agendamento' }, { status: 500 });
  }
}
