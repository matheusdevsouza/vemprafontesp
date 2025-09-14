# Script PowerShell para criar prerender-manifest.json
# Execute com: .\create-prerender.ps1

Write-Host "🔧 Criando prerender-manifest.json..." -ForegroundColor Cyan

# Verificar se a pasta .next existe
if (-not (Test-Path ".next")) {
    Write-Host "📁 Criando pasta .next..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path ".next" -Force | Out-Null
}

# Conteúdo do prerender-manifest.json
$manifestContent = @"
{
  "version": 4,
  "routes": {},
  "dynamicRoutes": {
    "/produto/[slug]": {
      "routeRegex": "^/produto/([^/]+?)(?:/)?$",
      "dataRoute": "/produto/[slug].json",
      "dataRouteRegex": "^/produto/([^/]+?)\\.json$",
      "fallback": null,
      "dataCacheRouteRegex": "^/produto/([^/]+?)\\.json$"
    },
    "/marca/[slug]": {
      "routeRegex": "^/marca/([^/]+?)(?:/)?$",
      "dataRoute": "/marca/[slug].json", 
      "dataRouteRegex": "^/marca/([^/]+?)\\.json$",
      "fallback": null,
      "dataCacheRouteRegex": "^/marca/([^/]+?)\\.json$"
    },
    "/modelo/[slug]": {
      "routeRegex": "^/modelo/([^/]+?)(?:/)?$",
      "dataRoute": "/modelo/[slug].json",
      "dataRouteRegex": "^/modelo/([^/]+?)\\.json$", 
      "fallback": null,
      "dataCacheRouteRegex": "^/modelo/([^/]+?)\\.json$"
    }
  },
  "notFoundRoutes": [],
  "preview": {
    "previewModeId": "development",
    "previewModeSigningKey": "development", 
    "previewModeEncryptionKey": "development"
  },
  "staticRoutes": [
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
  "buildId": "build-$(Get-Date -Format 'yyyyMMddHHmmss')",
  "buildTime": "$(Get-Date -Format 'yyyy-MM-ddTHH:mm:ss.fffZ')",
  "uploadRoutes": {
    "/uploads/products": {
      "type": "static",
      "cacheControl": "public, max-age=31536000"
    }
  }
}
"@

# Escrever o arquivo
$manifestPath = ".next\prerender-manifest.json"
$manifestContent | Out-File -FilePath $manifestPath -Encoding UTF8 -Force

# Verificar se foi criado
if (Test-Path $manifestPath) {
    $fileSize = (Get-Item $manifestPath).Length
    Write-Host "✅ prerender-manifest.json criado com sucesso!" -ForegroundColor Green
    Write-Host "📄 Localização: $((Get-Item $manifestPath).FullName)" -ForegroundColor Gray
    Write-Host "📊 Tamanho: $fileSize bytes" -ForegroundColor Gray
    
    # Verificar conteúdo
    $manifest = Get-Content $manifestPath | ConvertFrom-Json
    Write-Host "🔍 Verificação:" -ForegroundColor Cyan
    Write-Host "  - Versão: $($manifest.version)" -ForegroundColor Gray
    Write-Host "  - Rotas estáticas: $($manifest.staticRoutes.Count)" -ForegroundColor Gray
    Write-Host "  - Rotas dinâmicas: $($manifest.dynamicRoutes.PSObject.Properties.Count)" -ForegroundColor Gray
    Write-Host "  - Build ID: $($manifest.buildId)" -ForegroundColor Gray
} else {
    Write-Host "❌ Erro ao criar prerender-manifest.json" -ForegroundColor Red
    exit 1
}

Write-Host "`n🚀 Pronto! Agora você pode executar: npm run start" -ForegroundColor Green


