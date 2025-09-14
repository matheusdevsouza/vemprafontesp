const fs = require('fs');
const path = require('path');

// Função para gerar prerender-manifest.json completo
function createPrerenderManifest() {
  const manifest = {
    version: 4,
    routes: {},
    dynamicRoutes: {},
    notFoundRoutes: [],
    preview: {
      previewModeId: "development",
      previewModeSigningKey: "development",
      previewModeEncryptionKey: "development"
    },
    // Adicionar rotas específicas do projeto
    staticRoutes: [
      "/",
      "/login",
      "/criar-conta",
      "/verificar-email",
      "/redefinir-senha",
      "/esqueci-senha",
      "/produtos",
      "/marcas",
      "/modelos",
      "/sobre",
      "/contato",
      "/faq",
      "/como-comprar",
      "/termos-de-uso",
      "/politica-de-privacidade",
      "/trocas-e-devolucoes"
    ],
    // Rotas dinâmicas do projeto
    dynamicRoutes: {
      "/produto/[slug]": {
        routeRegex: "^/produto/([^/]+?)(?:/)?$",
        dataRoute: "/produto/[slug].json",
        dataRouteRegex: "^/produto/([^/]+?)\\.json$",
        fallback: null,
        dataCacheRouteRegex: "^/produto/([^/]+?)\\.json$"
      },
      "/marca/[slug]": {
        routeRegex: "^/marca/([^/]+?)(?:/)?$",
        dataRoute: "/marca/[slug].json",
        dataRouteRegex: "^/marca/([^/]+?)\\.json$",
        fallback: null,
        dataCacheRouteRegex: "^/marca/([^/]+?)\\.json$"
      },
      "/modelo/[slug]": {
        routeRegex: "^/modelo/([^/]+?)(?:/)?$",
        dataRoute: "/modelo/[slug].json",
        dataRouteRegex: "^/modelo/([^/]+?)\\.json$",
        fallback: null,
        dataCacheRouteRegex: "^/modelo/([^/]+?)\\.json$"
      }
    },
    // Configurações de build
    buildId: `build-${Date.now()}`,
    buildTime: new Date().toISOString(),
    // Configurações específicas para uploads
    uploadRoutes: {
      "/uploads/products": {
        type: "static",
        cacheControl: "public, max-age=31536000"
      }
    }
  };

  return manifest;
}

// Função principal
function main() {
  try {
    console.log('🔧 Criando prerender-manifest.json...');

    // Verificar se a pasta .next existe
    const nextDir = path.join(process.cwd(), '.next');
    if (!fs.existsSync(nextDir)) {
      console.log('📁 Criando pasta .next...');
      fs.mkdirSync(nextDir, { recursive: true });
    }

    // Gerar o manifest
    const manifest = createPrerenderManifest();
    
    // Caminho do arquivo
    const manifestPath = path.join(nextDir, 'prerender-manifest.json');
    
    // Escrever o arquivo
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    
    console.log('✅ prerender-manifest.json criado com sucesso!');
    console.log('📄 Localização:', manifestPath);
    console.log('📊 Tamanho:', fs.statSync(manifestPath).size, 'bytes');
    
    // Verificar se o arquivo foi criado corretamente
    const createdManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    console.log('🔍 Verificação:');
    console.log('  - Versão:', createdManifest.version);
    console.log('  - Rotas estáticas:', createdManifest.staticRoutes?.length || 0);
    console.log('  - Rotas dinâmicas:', Object.keys(createdManifest.dynamicRoutes || {}).length);
    console.log('  - Build ID:', createdManifest.buildId);
    
  } catch (error) {
    console.error('❌ Erro ao criar prerender-manifest.json:', error.message);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { createPrerenderManifest, main };


