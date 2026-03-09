'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon, 
  Users, 
  Clock, 
  Phone,
  Trash2,
  Edit,
  User,
  Search,
  CheckCircle2,
  XCircle,
  MapPin,
  Instagram,
  Sparkles,
  Heart,
  LogOut,
  Lock,
  Download,
  Loader2
} from 'lucide-react';

// Types
interface Cliente {
  id: string;
  nome: string;
  telefone: string | null;
  email: string | null;
  observacoes: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { agendamentos: number };
}

interface Agendamento {
  id: string;
  clienteId: string;
  cliente: Cliente;
  data: string;
  horaInicio: string;
  horaFim: string;
  servico: string;
  valor: number | null;
  status: string;
  observacoes: string | null;
  createdAt: string;
  updatedAt: string;
}

// Status config
const statusConfig = {
  agendado: { label: 'Agendado', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200', icon: Clock },
  confirmado: { label: 'Confirmado', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200', icon: CheckCircle2 },
  concluido: { label: 'Concluído', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: CheckCircle2 },
  cancelado: { label: 'Cancelado', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: XCircle },
};

// Serviços do Espaço Ane
const servicosEspacoAne = [
  { nome: 'Método Liso Espelhado', duracao: 180, valorBase: 250 },
  { nome: 'Combo Liso Espelhado Completo', duracao: 240, valorBase: 350 },
  { nome: 'Combo Hidratação + Liso', duracao: 210, valorBase: 300 },
  { nome: 'Combo Manutenção (Retoque)', duracao: 120, valorBase: 180 },
  { nome: 'Combo Primeira Vez', duracao: 270, valorBase: 380 },
  { nome: 'Combo Especial Curto', duracao: 120, valorBase: 130 },
  { nome: 'Combo Especial Médio', duracao: 150, valorBase: 150 },
  { nome: 'Combo Especial Grande', duracao: 180, valorBase: 170 },
  { nome: 'Hidratação Profissional', duracao: 60, valorBase: 80 },
  { nome: 'Corte Feminino', duracao: 45, valorBase: 50 },
  { nome: 'Corte Masculino', duracao: 30, valorBase: 35 },
  { nome: 'Escova', duracao: 45, valorBase: 60 },
  { nome: 'Mechas/Luzes', duracao: 180, valorBase: 200 },
  { nome: 'Coloração', duracao: 120, valorBase: 150 },
  { nome: 'Outro Serviço', duracao: 60, valorBase: 0 },
];

// Horários disponíveis
const horariosDisponiveis = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00'
];

export default function AgendaPage() {
  const { toast } = useToast();
  
  // Estado de autenticação - simplificado
  const [logado, setLogado] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [senha, setSenha] = useState('');
  const [erroLogin, setErroLogin] = useState('');
  const [fazendoLogin, setFazendoLogin] = useState(false);
  
  // Estados principais
  const [currentDate, setCurrentDate] = useState(new Date());
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados de modais
  const [modalAgendamento, setModalAgendamento] = useState(false);
  const [modalClientes, setModalClientes] = useState(false);
  const [modalDetalhe, setModalDetalhe] = useState(false);
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState<Agendamento | null>(null);
  
  // Estados de formulário
  const [formData, setFormData] = useState({
    clienteId: '',
    data: '',
    horaInicio: '',
    horaFim: '',
    servico: '',
    valor: '',
    status: 'agendado',
    observacoes: ''
  });
  
  // Estados de cliente
  const [clienteForm, setClienteForm] = useState({
    nome: '',
    telefone: '',
    email: '',
    observacoes: ''
  });
  const [editandoCliente, setEditandoCliente] = useState<Cliente | null>(null);
  const [buscaCliente, setBuscaCliente] = useState('');
  
  // Verificar autenticação ao carregar
  useEffect(() => {
    const verificarSessao = async () => {
      try {
        const response = await fetch('/api/auth/login');
        const data = await response.json();
        setLogado(data.authenticated === true);
      } catch {
        setLogado(false);
      } finally {
        setCarregando(false);
      }
    };
    verificarSessao();
  }, []);
  
  // Função de login
  const fazerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFazendoLogin(true);
    setErroLogin('');
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senha })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setLogado(true);
        setSenha('');
        toast({ title: 'Bem-vinda!', description: 'Login realizado com sucesso.' });
      } else {
        setErroLogin('Senha incorreta');
      }
    } catch {
      setErroLogin('Erro ao fazer login');
    } finally {
      setFazendoLogin(false);
    }
  };
  
  // Função de logout
  const fazerLogout = async () => {
    try {
      await fetch('/api/auth/login', { method: 'DELETE' });
      setLogado(false);
      toast({ title: 'Até logo!', description: 'Logout realizado.' });
    } catch {
      toast({ title: 'Erro', description: 'Erro ao sair', variant: 'destructive' });
    }
  };
  
  // Exportar backup
  const exportarBackup = async (formato: 'json' | 'csv') => {
    try {
      const response = await fetch(`/api/backup?formato=${formato}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-espaco-ane-${new Date().toISOString().split('T')[0]}.${formato}`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast({ title: 'Backup exportado!', description: `Arquivo ${formato.toUpperCase()} baixado.` });
    } catch {
      toast({ title: 'Erro', description: 'Erro ao exportar', variant: 'destructive' });
    }
  };
  
  // Calcular mês atual
  const mesAtual = useMemo(() => {
    return `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  }, [currentDate]);
  
  // Carregar dados quando logado
  useEffect(() => {
    if (!logado) return;
    
    const carregarDados = async () => {
      setLoading(true);
      try {
        const [respAg, respCl] = await Promise.all([
          fetch(`/api/agendamentos?mes=${mesAtual}`),
          fetch('/api/clientes')
        ]);
        
        if (respAg.ok) setAgendamentos(await respAg.json());
        if (respCl.ok) setClientes(await respCl.json());
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };
    
    carregarDados();
  }, [logado, mesAtual]);
  
  // Navegação do calendário
  const mesAnterior = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const proximoMes = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const irParaHoje = () => setCurrentDate(new Date());
  
  // Abrir novo agendamento
  const abrirNovoAgendamento = (data?: Date) => {
    const dataFmt = data ? data.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    setFormData({
      clienteId: '',
      data: dataFmt,
      horaInicio: '',
      horaFim: '',
      servico: '',
      valor: '',
      status: 'agendado',
      observacoes: ''
    });
    setAgendamentoSelecionado(null);
    setModalAgendamento(true);
  };
  
  // Editar agendamento
  const abrirEditarAgendamento = (ag: Agendamento) => {
    setFormData({
      clienteId: ag.clienteId,
      data: new Date(ag.data).toISOString().split('T')[0],
      horaInicio: ag.horaInicio,
      horaFim: ag.horaFim,
      servico: ag.servico,
      valor: ag.valor?.toString() || '',
      status: ag.status,
      observacoes: ag.observacoes || ''
    });
    setAgendamentoSelecionado(ag);
    setModalAgendamento(true);
  };
  
  // Salvar agendamento
  const salvarAgendamento = async () => {
    try {
      const url = agendamentoSelecionado ? `/api/agendamentos/${agendamentoSelecionado.id}` : '/api/agendamentos';
      const method = agendamentoSelecionado ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          valor: formData.valor ? parseFloat(formData.valor) : null
        })
      });
      
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Erro ao salvar');
      }
      
      toast({ title: agendamentoSelecionado ? 'Atualizado!' : 'Agendado!' });
      setModalAgendamento(false);
      
      // Recarregar
      const resp = await fetch(`/api/agendamentos?mes=${mesAtual}`);
      if (resp.ok) setAgendamentos(await resp.json());
    } catch (error) {
      toast({ title: 'Erro', description: String(error), variant: 'destructive' });
    }
  };
  
  // Excluir agendamento
  const excluirAgendamento = async (id: string) => {
    try {
      await fetch(`/api/agendamentos/${id}`, { method: 'DELETE' });
      toast({ title: 'Excluído!' });
      setModalDetalhe(false);
      const resp = await fetch(`/api/agendamentos?mes=${mesAtual}`);
      if (resp.ok) setAgendamentos(await resp.json());
    } catch {
      toast({ title: 'Erro', description: 'Erro ao excluir', variant: 'destructive' });
    }
  };
  
  // Salvar cliente
  const salvarCliente = async () => {
    if (!clienteForm.nome.trim()) {
      toast({ title: 'Erro', description: 'Nome obrigatório', variant: 'destructive' });
      return;
    }
    
    try {
      const url = editandoCliente ? `/api/clientes/${editandoCliente.id}` : '/api/clientes';
      const method = editandoCliente ? 'PUT' : 'POST';
      
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clienteForm)
      });
      
      toast({ title: editandoCliente ? 'Atualizado!' : 'Cadastrado!' });
      setClienteForm({ nome: '', telefone: '', email: '', observacoes: '' });
      setEditandoCliente(null);
      
      const resp = await fetch('/api/clientes');
      if (resp.ok) setClientes(await resp.json());
    } catch {
      toast({ title: 'Erro', description: 'Erro ao salvar', variant: 'destructive' });
    }
  };
  
  // Excluir cliente
  const excluirCliente = async (id: string) => {
    try {
      await fetch(`/api/clientes/${id}`, { method: 'DELETE' });
      toast({ title: 'Excluído!' });
      const resp = await fetch('/api/clientes');
      if (resp.ok) setClientes(await resp.json());
    } catch {
      toast({ title: 'Erro', description: 'Erro ao excluir', variant: 'destructive' });
    }
  };
  
  // Atualizar serviço
  const atualizarServico = (nome: string) => {
    const srv = servicosEspacoAne.find(s => s.nome === nome);
    if (srv) {
      setFormData(prev => {
        let horaFim = prev.horaFim;
        if (prev.horaInicio) {
          const [h, m] = prev.horaInicio.split(':').map(Number);
          const d = new Date();
          d.setHours(h, m + srv.duracao);
          horaFim = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
        }
        return { 
          ...prev, 
          servico: nome, 
          horaFim,
          valor: srv.valorBase > 0 ? srv.valorBase.toString() : prev.valor
        };
      });
    }
  };
  
  // Utilitários
  const formatarDataDisplay = (data: Date) => data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  
  const agendamentosPorDia = useMemo(() => {
    const mapa: Record<string, Agendamento[]> = {};
    agendamentos.forEach(ag => {
      const key = new Date(ag.data).toISOString().split('T')[0];
      if (!mapa[key]) mapa[key] = [];
      mapa[key].push(ag);
    });
    return mapa;
  }, [agendamentos]);
  
  // Gerar dias do calendário
  const diasDoCalendario = useMemo(() => {
    const ano = currentDate.getFullYear();
    const mes = currentDate.getMonth();
    const primeiro = new Date(ano, mes, 1);
    const ultimo = new Date(ano, mes + 1, 0);
    const dias: { data: Date; isCurrentMonth: boolean }[] = [];
    
    const diaSemana = primeiro.getDay();
    for (let i = diaSemana - 1; i >= 0; i--) {
      dias.push({ data: new Date(ano, mes, -i), isCurrentMonth: false });
    }
    
    for (let i = 1; i <= ultimo.getDate(); i++) {
      dias.push({ data: new Date(ano, mes, i), isCurrentMonth: true });
    }
    
    const ultimoDiaSemana = ultimo.getDay();
    for (let i = 1; i < 7 - ultimoDiaSemana; i++) {
      dias.push({ data: new Date(ano, mes + 1, i), isCurrentMonth: false });
    }
    
    return dias;
  }, [currentDate]);
  
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  // Estatísticas
  const statsMes = useMemo(() => {
    const total = agendamentos.length;
    const confirmados = agendamentos.filter(a => a.status === 'confirmado').length;
    const concluidos = agendamentos.filter(a => a.status === 'concluido').length;
    const valorTotal = agendamentos
      .filter(a => a.status !== 'cancelado' && a.valor)
      .reduce((acc, a) => acc + (a.valor || 0), 0);
    return { total, confirmados, concluidos, valorTotal };
  }, [agendamentos]);
  
  // Clientes filtrados
  const clientesFiltrados = useMemo(() => {
    if (!buscaCliente) return clientes;
    const t = buscaCliente.toLowerCase();
    return clientes.filter(c => 
      c.nome.toLowerCase().includes(t) || 
      c.telefone?.includes(t) || 
      c.email?.toLowerCase().includes(t)
    );
  }, [clientes, buscaCliente]);

  // ============ TELA DE LOADING ============
  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a1410] via-[#2a1f15] to-[#1a1410]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4a853] mx-auto mb-4"></div>
          <p className="text-[#d4c6aa]">Carregando...</p>
        </div>
      </div>
    );
  }

  // ============ TELA DE LOGIN ============
  if (!logado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a1410] via-[#2a1f15] to-[#1a1410] p-4">
        <Card className="w-full max-w-md bg-[#2a1f15]/90 backdrop-blur-sm border-[#d4a853]/30">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-br from-[#d4a853] to-[#b8943f] p-3 rounded-lg shadow-lg">
                <Sparkles className="h-8 w-8 text-[#1a1410]" />
              </div>
            </div>
            <CardTitle className="text-2xl text-[#f4dfb0]">Espaço Ane</CardTitle>
            <CardDescription className="text-[#d4c6aa]">Digite a senha para acessar</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={fazerLogin} className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b5b4a]" />
                <Input
                  type="password"
                  placeholder="Senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="pl-10 bg-[#1a1410] border-[#d4a853]/30 text-[#f4dfb0]"
                />
              </div>
              {erroLogin && <p className="text-sm text-red-400">{erroLogin}</p>}
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-[#d4a853] to-[#b8943f] text-[#1a1410] font-semibold"
                disabled={fazendoLogin || !senha}
              >
                {fazendoLogin ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Entrar
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ============ APLICAÇÃO PRINCIPAL ============
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1410] via-[#2a1f15] to-[#1a1410]">
      {/* Header */}
      <header className="bg-[#1a1410]/95 backdrop-blur-sm border-b border-[#d4a853]/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-[#d4a853] to-[#b8943f] p-2 rounded-lg shadow-lg">
                <Sparkles className="h-6 w-6 text-[#1a1410]" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#f4dfb0]">Espaço Ane</h1>
                <p className="text-sm text-[#d4c6aa]">Agenda de Atendimento</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <Button variant="outline" onClick={() => setModalClientes(true)} className="gap-2 border-[#d4a853]/30 text-[#d4c6aa]">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Clientes</span>
              </Button>
              <Button onClick={() => abrirNovoAgendamento()} className="bg-gradient-to-r from-[#d4a853] to-[#b8943f] text-[#1a1410] font-semibold gap-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Novo</span>
              </Button>
              <Button variant="ghost" onClick={fazerLogout} className="gap-2 text-[#d4c6aa]">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-[#2a1f15]/80 border-[#d4a853]/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-[#d4a853]" />
                <span className="text-sm text-[#d4c6aa]">Agendamentos</span>
              </div>
              <p className="text-2xl font-bold mt-1 text-[#f4dfb0]">{statsMes.total}</p>
            </CardContent>
          </Card>
          <Card className="bg-[#2a1f15]/80 border-[#d4a853]/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <span className="text-sm text-[#d4c6aa]">Confirmados</span>
              </div>
              <p className="text-2xl font-bold mt-1 text-[#f4dfb0]">{statsMes.confirmados}</p>
            </CardContent>
          </Card>
          <Card className="bg-[#2a1f15]/80 border-[#d4a853]/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                <span className="text-sm text-[#d4c6aa]">Concluídos</span>
              </div>
              <p className="text-2xl font-bold mt-1 text-[#f4dfb0]">{statsMes.concluidos}</p>
            </CardContent>
          </Card>
          <Card className="bg-[#2a1f15]/80 border-[#d4a853]/20">
            <CardContent className="p-4">
              <span className="text-sm text-[#d4c6aa]">Valor Mês</span>
              <p className="text-2xl font-bold mt-1 text-emerald-400">R$ {statsMes.valorTotal.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Calendar Nav */}
        <Card className="bg-[#2a1f15]/80 border-[#d4a853]/20 mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={mesAnterior} className="border-[#d4a853]/30 text-[#d4c6aa]">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-lg font-semibold min-w-[180px] text-center text-[#f4dfb0] capitalize">
                  {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </h2>
                <Button variant="outline" size="icon" onClick={proximoMes} className="border-[#d4a853]/30 text-[#d4c6aa]">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={irParaHoje} className="gap-2 border-[#d4a853]/30 text-[#d4c6aa]">
                  <CalendarIcon className="h-4 w-4" /> Hoje
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="gap-2 border-[#d4a853]/30 text-[#d4c6aa]">
                      <Download className="h-4 w-4" /> <span className="hidden sm:inline">Backup</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-[#1a1410] border-[#d4a853]/20">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-[#f4dfb0]">Exportar Backup</AlertDialogTitle>
                      <AlertDialogDescription className="text-[#d4c6aa]">Escolha o formato</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex gap-2">
                      <AlertDialogCancel className="border-[#d4a853]/30 text-[#d4c6aa]">Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => exportarBackup('json')} className="bg-[#d4a853] text-[#1a1410]">JSON</AlertDialogAction>
                      <AlertDialogAction onClick={() => exportarBackup('csv')} className="bg-[#d4a853] text-[#1a1410]">CSV</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar Grid */}
        <Card className="bg-[#2a1f15]/80 border-[#d4a853]/20">
          <CardContent className="p-2 sm:p-4">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                <div key={d} className="text-center text-sm font-medium text-[#d4a853] py-2">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {diasDoCalendario.map(({ data, isCurrentMonth }, i) => {
                const key = data.toISOString().split('T')[0];
                const ags = agendamentosPorDia[key] || [];
                const isHoje = data.getTime() === hoje.getTime();
                
                return (
                  <div
                    key={i}
                    className={`min-h-[80px] sm:min-h-[100px] p-1 sm:p-2 rounded-lg border cursor-pointer transition-all
                      ${isCurrentMonth ? 'bg-[#1a1410]/60 hover:border-[#d4a853]/50' : 'bg-[#1a1410]/30 opacity-50'}
                      ${isHoje ? 'border-[#d4a853] border-2 ring-2 ring-[#d4a853]/30' : 'border-[#3a2a1c]'}`}
                    onClick={() => abrirNovoAgendamento(data)}
                  >
                    <div className={`text-sm font-medium mb-1 ${isHoje ? 'text-[#d4a853]' : isCurrentMonth ? 'text-[#f4dfb0]' : 'text-[#6b5b4a]'}`}>
                      {data.getDate()}{isHoje && <span className="text-xs ml-1">(Hoje)</span>}
                    </div>
                    <div className="space-y-1 max-h-[50px] overflow-y-auto">
                      {ags.slice(0, 3).map(ag => (
                        <div
                          key={ag.id}
                          onClick={e => { e.stopPropagation(); setAgendamentoSelecionado(ag); setModalDetalhe(true); }}
                          className={`text-xs p-1 rounded truncate ${statusConfig[ag.status as keyof typeof statusConfig]?.color}`}
                        >
                          {ag.horaInicio} - {ag.cliente.nome.split(' ')[0]}
                        </div>
                      ))}
                      {ags.length > 3 && <div className="text-xs text-[#d4c6aa] text-center">+{ags.length - 3}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Info */}
        <Card className="bg-[#2a1f15]/80 border-[#d4a853]/20 mt-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Heart className="h-5 w-5 text-[#d4a853]" />
                <div>
                  <p className="text-[#f4dfb0] font-medium">Método Liso Espelhado</p>
                  <p className="text-sm text-[#d4c6aa]">Técnica sem formol - Resultado no mesmo dia</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <a href="https://www.instagram.com/anehair_/" target="_blank" rel="noopener" className="flex items-center gap-2 text-[#d4a853] hover:text-[#f4dfb0]">
                  <Instagram className="h-5 w-5" /> @anehair_
                </a>
                <a href="https://wa.me/5553999138142" target="_blank" rel="noopener" className="flex items-center gap-2 text-[#d4a853] hover:text-[#f4dfb0]">
                  <Phone className="h-5 w-5" /> (53) 99913-8142
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Modal Agendamento */}
      <Dialog open={modalAgendamento} onOpenChange={setModalAgendamento}>
        <DialogContent className="max-w-md bg-[#1a1410] border-[#d4a853]/20 text-[#f4dfb0]">
          <DialogHeader>
            <DialogTitle>{agendamentoSelecionado ? 'Editar' : 'Novo'} Agendamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-[#d4c6aa]">Cliente *</Label>
              <Select value={formData.clienteId} onValueChange={v => setFormData(p => ({ ...p, clienteId: v }))}>
                <SelectTrigger className="bg-[#2a1f15] border-[#d4a853]/30"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent className="bg-[#2a1f15] border-[#d4a853]/30">
                  {clientes.map(c => <SelectItem key={c.id} value={c.id} className="text-[#f4dfb0]">{c.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[#d4c6aa]">Data *</Label>
                <Input type="date" value={formData.data} onChange={e => setFormData(p => ({ ...p, data: e.target.value }))} className="bg-[#2a1f15] border-[#d4a853]/30 text-[#f4dfb0]" />
              </div>
              <div className="space-y-2">
                <Label className="text-[#d4c6aa]">Status</Label>
                <Select value={formData.status} onValueChange={v => setFormData(p => ({ ...p, status: v }))}>
                  <SelectTrigger className="bg-[#2a1f15] border-[#d4a853]/30"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#2a1f15] border-[#d4a853]/30">
                    {Object.entries(statusConfig).map(([k, v]) => <SelectItem key={k} value={k} className="text-[#f4dfb0]">{v.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[#d4c6aa]">Serviço *</Label>
              <Select value={formData.servico} onValueChange={atualizarServico}>
                <SelectTrigger className="bg-[#2a1f15] border-[#d4a853]/30"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent className="bg-[#2a1f15] border-[#d4a853]/30">
                  {servicosEspacoAne.map(s => <SelectItem key={s.nome} value={s.nome} className="text-[#f4dfb0]">{s.nome} {s.valorBase > 0 && `(R$ ${s.valorBase})`}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[#d4c6aa]">Início *</Label>
                <Select value={formData.horaInicio} onValueChange={v => setFormData(p => ({ ...p, horaInicio: v }))}>
                  <SelectTrigger className="bg-[#2a1f15] border-[#d4a853]/30"><SelectValue placeholder="Hora" /></SelectTrigger>
                  <SelectContent className="bg-[#2a1f15] border-[#d4a853]/30">
                    {horariosDisponiveis.map(h => <SelectItem key={h} value={h} className="text-[#f4dfb0]">{h}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[#d4c6aa]">Fim *</Label>
                <Select value={formData.horaFim} onValueChange={v => setFormData(p => ({ ...p, horaFim: v }))}>
                  <SelectTrigger className="bg-[#2a1f15] border-[#d4a853]/30"><SelectValue placeholder="Hora" /></SelectTrigger>
                  <SelectContent className="bg-[#2a1f15] border-[#d4a853]/30">
                    {horariosDisponiveis.map(h => <SelectItem key={h} value={h} className="text-[#f4dfb0]">{h}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[#d4c6aa]">Valor (R$)</Label>
              <Input type="number" step="0.01" value={formData.valor} onChange={e => setFormData(p => ({ ...p, valor: e.target.value }))} className="bg-[#2a1f15] border-[#d4a853]/30 text-[#f4dfb0]" />
            </div>
            <div className="space-y-2">
              <Label className="text-[#d4c6aa]">Observações</Label>
              <Textarea value={formData.observacoes} onChange={e => setFormData(p => ({ ...p, observacoes: e.target.value }))} className="bg-[#2a1f15] border-[#d4a853]/30 text-[#f4dfb0]" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalAgendamento(false)} className="border-[#d4a853]/30 text-[#d4c6aa]">Cancelar</Button>
            <Button onClick={salvarAgendamento} disabled={!formData.clienteId || !formData.data || !formData.horaInicio || !formData.horaFim || !formData.servico} className="bg-[#d4a853] text-[#1a1410] font-semibold">
              {agendamentoSelecionado ? 'Atualizar' : 'Agendar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Detalhe */}
      <Dialog open={modalDetalhe} onOpenChange={setModalDetalhe}>
        <DialogContent className="max-w-md bg-[#1a1410] border-[#d4a853]/20 text-[#f4dfb0]">
          <DialogHeader><DialogTitle>Detalhes</DialogTitle></DialogHeader>
          {agendamentoSelecionado && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3">
                <div className="bg-[#d4a853]/20 p-3 rounded-full"><User className="h-6 w-6 text-[#d4a853]" /></div>
                <div>
                  <h3 className="font-semibold text-lg">{agendamentoSelecionado.cliente.nome}</h3>
                  {agendamentoSelecionado.cliente.telefone && <p className="text-sm text-[#d4c6aa]">{agendamentoSelecionado.cliente.telefone}</p>}
                </div>
              </div>
              <Separator className="bg-[#d4a853]/20" />
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-sm text-[#d4c6aa]">Data</p><p className="font-medium">{formatarDataDisplay(new Date(agendamentoSelecionado.data))}</p></div>
                <div><p className="text-sm text-[#d4c6aa]">Horário</p><p className="font-medium">{agendamentoSelecionado.horaInicio} - {agendamentoSelecionado.horaFim}</p></div>
                <div><p className="text-sm text-[#d4c6aa]">Serviço</p><p className="font-medium">{agendamentoSelecionado.servico}</p></div>
                <div><p className="text-sm text-[#d4c6aa]">Valor</p><p className="font-medium text-emerald-400">{agendamentoSelecionado.valor ? `R$ ${agendamentoSelecionado.valor.toFixed(2)}` : 'N/A'}</p></div>
              </div>
              <div><p className="text-sm text-[#d4c6aa]">Status</p><Badge className={statusConfig[agendamentoSelecionado.status as keyof typeof statusConfig]?.color}>{statusConfig[agendamentoSelecionado.status as keyof typeof statusConfig]?.label}</Badge></div>
              {agendamentoSelecionado.observacoes && <div><p className="text-sm text-[#d4c6aa]">Obs</p><p className="text-sm bg-[#2a1f15] p-2 rounded">{agendamentoSelecionado.observacoes}</p></div>}
              <Separator className="bg-[#d4a853]/20" />
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 gap-2 border-[#d4a853]/30 text-[#d4c6aa]" onClick={() => abrirEditarAgendamento(agendamentoSelecionado)}><Edit className="h-4 w-4" /> Editar</Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild><Button variant="destructive" className="gap-2"><Trash2 className="h-4 w-4" /> Excluir</Button></AlertDialogTrigger>
                  <AlertDialogContent className="bg-[#1a1410] border-[#d4a853]/20">
                    <AlertDialogHeader><AlertDialogTitle className="text-[#f4dfb0]">Excluir?</AlertDialogTitle><AlertDialogDescription className="text-[#d4c6aa]">Ação irreversível.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-[#2a1f15] border-[#d4a853]/30 text-[#f4dfb0]">Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => excluirAgendamento(agendamentoSelecionado.id)} className="bg-red-600">Excluir</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Sheet Clientes */}
      <Sheet open={modalClientes} onOpenChange={setModalClientes}>
        <SheetContent className="w-full sm:max-w-lg bg-[#1a1410] border-l-[#d4a853]/20 text-[#f4dfb0]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-[#d4a853]" /> Clientes</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-6">
            <Card className="bg-[#2a1f15]/80 border-[#d4a853]/20">
              <CardHeader><CardTitle className="text-base">{editandoCliente ? 'Editar' : 'Nova'} Cliente</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[#d4c6aa]">Nome *</Label>
                  <Input value={clienteForm.nome} onChange={e => setClienteForm(p => ({ ...p, nome: e.target.value }))} className="bg-[#1a1410] border-[#d4a853]/30 text-[#f4dfb0]" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#d4c6aa]">Telefone</Label>
                  <Input value={clienteForm.telefone} onChange={e => setClienteForm(p => ({ ...p, telefone: e.target.value }))} className="bg-[#1a1410] border-[#d4a853]/30 text-[#f4dfb0]" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#d4c6aa]">Email</Label>
                  <Input value={clienteForm.email} onChange={e => setClienteForm(p => ({ ...p, email: e.target.value }))} className="bg-[#1a1410] border-[#d4a853]/30 text-[#f4dfb0]" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#d4c6aa]">Observações</Label>
                  <Textarea value={clienteForm.observacoes} onChange={e => setClienteForm(p => ({ ...p, observacoes: e.target.value }))} className="bg-[#1a1410] border-[#d4a853]/30 text-[#f4dfb0]" />
                </div>
                <div className="flex gap-2">
                  <Button onClick={salvarCliente} disabled={!clienteForm.nome.trim()} className="flex-1 bg-[#d4a853] text-[#1a1410] font-semibold">{editandoCliente ? 'Atualizar' : 'Cadastrar'}</Button>
                  {editandoCliente && <Button variant="outline" onClick={() => { setEditandoCliente(null); setClienteForm({ nome: '', telefone: '', email: '', observacoes: '' }); }} className="border-[#d4a853]/30 text-[#d4c6aa]">Cancelar</Button>}
                </div>
              </CardContent>
            </Card>
            <div>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b5b4a]" />
                <Input value={buscaCliente} onChange={e => setBuscaCliente(e.target.value)} placeholder="Buscar..." className="pl-9 bg-[#2a1f15] border-[#d4a853]/30 text-[#f4dfb0]" />
              </div>
              <ScrollArea className="h-[250px]">
                <div className="space-y-2 pr-4">
                  {clientesFiltrados.length === 0 ? <p className="text-center text-[#d4c6aa] py-8">Nenhuma cliente</p> : clientesFiltrados.map(c => (
                    <div key={c.id} className="flex items-center justify-between p-3 bg-[#2a1f15]/80 rounded-lg border border-[#d4a853]/10">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{c.nome}</p>
                        <p className="text-sm text-[#d4c6aa]">{c.telefone}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setEditandoCliente(c); setClienteForm({ nome: c.nome, telefone: c.telefone || '', email: c.email || '', observacoes: c.observacoes || '' }); }} className="text-[#d4a853]"><Edit className="h-4 w-4" /></Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-red-400"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                          <AlertDialogContent className="bg-[#1a1410] border-[#d4a853]/20">
                            <AlertDialogHeader><AlertDialogTitle className="text-[#f4dfb0]">Excluir?</AlertDialogTitle></AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-[#2a1f15] border-[#d4a853]/30 text-[#f4dfb0]">Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => excluirCliente(c.id)} className="bg-red-600">Excluir</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Footer */}
      <footer className="bg-[#1a1410]/80 border-t border-[#d4a853]/20 mt-auto py-4">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-[#d4a853] font-medium">Espaço Ane</p>
          <p className="text-sm text-[#d4c6aa]">Especialista em Alisamentos - Pelotas, RS</p>
        </div>
      </footer>
    </div>
  );
}
