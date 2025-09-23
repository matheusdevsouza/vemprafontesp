/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Configuração de imagens otimizada
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'vemprafontesp.com.br',
        pathname: '/uploads/**',
      }
    ],
    unoptimized: true, // Desabilitar otimização completamente para evitar erros 400
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Configurações experimentais
  experimental: {
    serverComponentsExternalPackages: ['mysql2'],
    serverActions: {
      allowedOrigins: ['localhost:3000', 'vemprafontesp.com.br']
    }
  },

  // Headers de segurança centralizados no middleware.ts

  // Configurações de build
  // output: 'standalone', // Removido para evitar problemas
  
  // Configurações de desenvolvimento
  typescript: {
    ignoreBuildErrors: false,
  },
  
  eslint: {
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig