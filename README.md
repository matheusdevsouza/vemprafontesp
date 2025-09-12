# 🏃‍♂️ Vem Pra Fonte

**E-commerce especializado em tênis Nike e Mizuno**

## 📋 Sobre o Projeto

O Vem Pra Fonte é uma plataforma de e-commerce moderna desenvolvida em Next.js 14, focada na venda de tênis das marcas Nike e Mizuno. O projeto oferece uma experiência de compra completa com integração ao Mercado Pago, sistema de autenticação seguro e painel administrativo.

## 🚀 Tecnologias Utilizadas

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Banco de Dados**: MySQL/MariaDB
- **Autenticação**: NextAuth.js
- **Pagamentos**: Mercado Pago API
- **Email**: Nodemailer com SMTP
- **Deploy**: PM2, Nginx

## 📁 Estrutura do Projeto

```
VemPraFonte/
├── 📁 src/                    # Código fonte da aplicação
│   ├── 📁 app/               # App Router do Next.js
│   │   ├── 📁 admin/         # Painel administrativo
│   │   ├── 📁 api/           # API Routes
│   │   └── 📁 [pages]/       # Páginas públicas
│   ├── 📁 components/        # Componentes React
│   ├── 📁 contexts/          # Contextos React
│   ├── 📁 hooks/             # Custom hooks
│   ├── 📁 lib/               # Utilitários e configurações
│   ├── 📁 sections/          # Seções da homepage
│   └── 📁 types/             # Definições TypeScript
├── 📁 public/                # Arquivos estáticos
├── 📁 prisma/                # Schema e migrações do banco
├── 📁 tests/                 # Arquivos de teste (ignorados no git)
├── 📁 scripts/               # Scripts de desenvolvimento
├── 📁 docs/                  # Documentação
└── 📁 private/               # Arquivos sensíveis (ignorados no git)
```

## ⚙️ Configuração do Ambiente

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/vem-pra-fonte.git
cd vem-pra-fonte
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
```bash
# Copie o template
cp env.example .env.local

# Edite o arquivo .env.local com suas configurações
```

### 4. Configure o banco de dados
```bash
# Execute as migrações do Prisma
npx prisma migrate deploy

# Gere o cliente Prisma
npx prisma generate
```

### 5. Execute o projeto
```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start
```

## 🔧 Variáveis de Ambiente

Consulte o arquivo `env.example` para ver todas as variáveis necessárias. **NUNCA** commite arquivos `.env` com dados reais!

### Principais variáveis:
- `DATABASE_URL`: String de conexão do MySQL
- `NEXTAUTH_SECRET`: Chave secreta para autenticação
- `MERCADOPAGO_ACCESS_TOKEN`: Token do Mercado Pago
- `SMTP_*`: Configurações de email

## 📊 Funcionalidades

### 🛍️ E-commerce
- ✅ Catálogo de produtos com filtros
- ✅ Carrinho de compras
- ✅ Checkout integrado com Mercado Pago
- ✅ Sistema de pedidos
- ✅ Rastreamento de pedidos

### 👤 Usuários
- ✅ Registro e login
- ✅ Recuperação de senha por email
- ✅ Perfil do usuário
- ✅ Histórico de pedidos
- ✅ Endereços de entrega

### 🔐 Administração
- ✅ Painel administrativo
- ✅ Gestão de produtos
- ✅ Gestão de pedidos
- ✅ Relatórios de vendas

### 🎨 Design
- ✅ Design responsivo
- ✅ Tema escuro/claro
- ✅ Animações suaves
- ✅ SEO otimizado

## 🚀 Deploy

### Produção com PM2
```bash
# Build do projeto
npm run build

# Iniciar com PM2
pm2 start ecosystem.config.js
```

### Configuração Nginx
```nginx
server {
    listen 80;
    server_name vemprafontesp.com.br;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🧪 Testes

Os arquivos de teste estão organizados na pasta `tests/` e são ignorados pelo git para manter o repositório limpo.

## 📝 Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento
npm run build        # Build para produção
npm run start        # Iniciar em produção
npm run lint         # Verificar código
npm run type-check   # Verificar tipos TypeScript
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

- **Email**: contato@vemprafontesp.com.br
- **WhatsApp**: +55 11 99999-9999
- **Website**: https://vemprafontesp.com.br

---

**Desenvolvido com ❤️ para os amantes de tênis!**
