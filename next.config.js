// Carregar variáveis de ambiente manualmente
const fs = require('fs');

function loadEnvFile(filePath) {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          let value = valueParts.join('=').trim();
          
          // Remover aspas duplas se existirem
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.slice(1, -1);
          }
          
          process.env[key.trim()] = value;
        }
      }
    }
  }
}

// Carregar arquivos de ambiente
loadEnvFile('.env.local');
loadEnvFile('.env');

// Debug das variáveis carregadas
console.log('🔧 [DEBUG] Variáveis carregadas no next.config.js:');
console.log('🔧 [DEBUG] DATABASE_URL:', process.env.DATABASE_URL);
console.log('🔧 [DEBUG] SMTP_HOST:', process.env.SMTP_HOST);
console.log('🔧 [DEBUG] NODE_ENV:', process.env.NODE_ENV);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Forçar carregamento dos arquivos de ambiente
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
  
  images: {
    domains: ['localhost', '127.0.0.1', 'vemprafontesp.com.br'],
    unoptimized: process.env.NODE_ENV === 'development'
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; img-src 'self' data: https:; connect-src 'self' https:; frame-src 'self' https://www.google.com; object-src 'none'; base-uri 'self'; form-action 'self';"
          }
        ]
      }
    ]
  },

  // Configurações de desenvolvimento
  experimental: {
    serverComponentsExternalPackages: ['mysql2']
  }
}

module.exports = nextConfig
