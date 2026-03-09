# Espaço Ane - Agenda de Atendimento

Sistema de agenda mensal interativa para cabeleireira.

## Funcionalidades

- Calendário mensal interativo
- Gestão de clientes (cadastro, edição, exclusão)
- Agendamentos com verificação de conflito de horários
- Status de agendamentos (Agendado, Confirmado, Concluído, Cancelado)
- Exportação de backup (JSON e CSV)
- Autenticação com senha
- Design responsivo (funciona no celular)
- Serviços pré-configurados do Espaço Ane

## Senha Padrão

`espacoane2024` (mude em produção!)

---

## Deploy na Vercel (100% Funcional)

### Passo 1: Criar Banco PostgreSQL Gratuito

#### Opção A: Neon.tech (Recomendado)
1. Acesse https://neon.tech
2. Crie uma conta gratuita
3. Crie um novo projeto
4. Copie a **Connection String** (ex: `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require`)

#### Opção B: Supabase
1. Acesse https://supabase.com
2. Crie um projeto
3. Vá em Project Settings > Database
4. Copie a URI do PostgreSQL

### Passo 2: Preparar o Projeto

```bash
# Trocar para schema PostgreSQL
cp prisma/schema.postgres.prisma prisma/schema.prisma

# Instalar dependências
bun install

# Configurar .env com a URL do PostgreSQL
# DATABASE_URL="sua-url-postgresql"
# SENHA_ACESSO="sua-senha-forte"

# Sincronizar banco
bun run db:push
```

### Passo 3: Subir para GitHub

```bash
git init
git add .
git commit -m "Espaço Ane Agenda"
git branch -M main
git remote add origin https://github.com/SEU_USER/espaco-ane-agenda.git
git push -u origin main
```

### Passo 4: Deploy na Vercel

1. Acesse https://vercel.com/new
2. Conecte seu GitHub
3. Selecione o repositório `espaco-ane-agenda`
4. Configure as variáveis de ambiente:
   ```
   DATABASE_URL = sua-url-postgresql
   SENHA_ACESSO = sua-senha-forte
   ```
5. Clique em "Deploy"
6. Aguarde ~2 minutos
7. Pronto! 🎉

---

## Desenvolvimento Local

```bash
# Instalar dependências
bun install

# Configurar .env
DATABASE_URL="file:./db/custom.db"
SENHA_ACESSO="espacoane2024"

# Sincronizar banco
bun run db:push

# Rodar em desenvolvimento
bun run dev
```

---

## Backup de Dados

Use o botão "Backup" no calendário para exportar:
- **JSON**: Backup completo para restauração
- **CSV**: Para abrir no Excel

---

## Tecnologias

- Next.js 16
- TypeScript
- Prisma ORM
- SQLite (dev) / PostgreSQL (prod)
- Tailwind CSS
- shadcn/ui
