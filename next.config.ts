import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    // Otimizações para produção
  },
  // Garantir que as variáveis de ambiente sejam expostas
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    SENHA_ACESSO: process.env.SENHA_ACESSO,
  },
};

export default nextConfig;
