import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Exportar todos os dados
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const formato = searchParams.get('formato') || 'json';

    const clientes = await db.cliente.findMany({
      orderBy: { nome: 'asc' }
    });

    const agendamentos = await db.agendamento.findMany({
      include: { cliente: true },
      orderBy: { data: 'desc' }
    });

    const servicos = await db.servico.findMany({
      orderBy: { nome: 'asc' }
    });

    const backup = {
      exportadoEm: new Date().toISOString(),
      espacoAne: {
        clientes,
        agendamentos,
        servicos
      }
    };

    if (formato === 'csv') {
      // Gerar CSV de clientes
      let csv = 'NOME,TELEFONE,EMAIL,OBSERVACOES\n';
      clientes.forEach(c => {
        csv += `"${c.nome}","${c.telefone || ''}","${c.email || ''}","${c.observacoes || ''}"\n`;
      });

      csv += '\n\nAGENDAMENTOS\n';
      csv += 'DATA,HORA_INICIO,HORA_FIM,CLIENTE,SERVICO,VALOR,STATUS,OBSERVACOES\n';
      agendamentos.forEach(a => {
        csv += `"${new Date(a.data).toLocaleDateString('pt-BR')}","${a.horaInicio}","${a.horaFim}","${a.cliente.nome}","${a.servico}","${a.valor || ''}","${a.status}","${a.observacoes || ''}"\n`;
      });

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="backup-espaco-ane-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }

    return new NextResponse(JSON.stringify(backup, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="backup-espaco-ane-${new Date().toISOString().split('T')[0]}.json"`
      }
    });
  } catch (error) {
    console.error('Erro ao exportar backup:', error);
    return NextResponse.json({ error: 'Erro ao exportar backup' }, { status: 500 });
  }
}
