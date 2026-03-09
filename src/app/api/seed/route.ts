import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Verificar se já existem clientes
    const clientesExistentes = await db.cliente.count();
    
    if (clientesExistentes > 0) {
      return NextResponse.json({ 
        message: 'Banco já foi populado',
        clientes: clientesExistentes 
      });
    }
    
    // Criar clientes de exemplo
    const clientes = await db.cliente.createMany({
      data: [
        { nome: 'Maria Silva', telefone: '(53) 99999-1111', email: 'maria@email.com', observacoes: 'Cabelo loiro, alergia a amônia' },
        { nome: 'Ana Paula', telefone: '(53) 99999-2222', email: 'ana@email.com', observacoes: 'Sempre faz Liso Espelhado' },
        { nome: 'Carla Mendes', telefone: '(53) 99999-3333', email: 'carla@email.com', observacoes: 'Cabelo cacheado, quer alisamento' },
        { nome: 'Juliana Costa', telefone: '(53) 99999-4444', email: 'juliana@email.com', observacoes: 'Cliente nova' },
        { nome: 'Patricia Lima', telefone: '(53) 99999-5555', email: 'patricia@email.com', observacoes: 'Faz manutenção a cada 2 meses' },
        { nome: 'Fernanda Souza', telefone: '(53) 99999-6666', email: 'fernanda@email.com', observacoes: '' },
        { nome: 'Renata Oliveira', telefone: '(53) 99999-7777', email: 'renata@email.com', observacoes: 'Cabelo tingido' },
        { nome: 'Beatriz Santos', telefone: '(53) 99999-8888', email: 'beatriz@email.com', observacoes: '' },
      ]
    });
    
    // Criar serviços
    const servicos = await db.servico.createMany({
      data: [
        { nome: 'Método Liso Espelhado', descricao: 'Alisamento sem formol, resultado no mesmo dia', duracao: 180, valor: 250 },
        { nome: 'Combo Liso Espelhado Completo', descricao: 'Avaliação, aplicação completa e finalização', duracao: 240, valor: 350 },
        { nome: 'Combo Hidratação + Liso', descricao: 'Hidratação + Liso Espelhado', duracao: 210, valor: 300 },
        { nome: 'Combo Manutenção', descricao: 'Retoque na raiz', duracao: 120, valor: 180 },
        { nome: 'Combo Primeira Vez', descricao: 'Primeira experiência com o Método', duracao: 270, valor: 380 },
        { nome: 'Combo Especial Curto', descricao: 'Higienização, Tratamento, Corte, Escova', duracao: 120, valor: 130 },
        { nome: 'Combo Especial Médio', descricao: 'Higienização, Tratamento, Corte, Escova', duracao: 150, valor: 150 },
        { nome: 'Combo Especial Grande', descricao: 'Higienização, Tratamento, Corte, Escova', duracao: 180, valor: 170 },
        { nome: 'Hidratação Profissional', descricao: 'Hidratação capilar profissional', duracao: 60, valor: 80 },
        { nome: 'Corte Feminino', descricao: 'Corte feminino', duracao: 45, valor: 50 },
        { nome: 'Corte Masculino', descricao: 'Corte masculino', duracao: 30, valor: 35 },
        { nome: 'Escova', descricao: 'Escova modeladora', duracao: 45, valor: 60 },
        { nome: 'Mechas/Luzes', descricao: 'Mechas ou luzes', duracao: 180, valor: 200 },
        { nome: 'Coloração', descricao: 'Coloração capilar', duracao: 120, valor: 150 },
      ]
    });
    
    return NextResponse.json({ 
      message: 'Banco populado com sucesso!',
      clientes: clientes.count,
      servicos: servicos.count
    });
  } catch (error) {
    console.error('Erro ao popular banco:', error);
    return NextResponse.json({ error: 'Erro ao popular banco' }, { status: 500 });
  }
}
