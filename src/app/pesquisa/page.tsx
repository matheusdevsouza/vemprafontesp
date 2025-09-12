'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { MagnifyingGlass, Package, ShoppingCart, Heart, Eye, ArrowRight, Funnel, ArrowsDownUp, Square, List } from 'phosphor-react'
import Image from 'next/image'
import Link from 'next/link'

// Função para formatar preços
const formatPrice = (price: any): string => {
  if (typeof price === 'number' && !isNaN(price)) {
    return price.toFixed(2).replace('.', ',')
  }
  if (typeof price === 'string') {
    const numPrice = parseFloat(price)
    if (!isNaN(numPrice)) {
      return numPrice.toFixed(2).replace('.', ',')
    }
  }
  return '0,00'
}

// Componente de partículas flutuantes
const FloatingParticles = () => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number }>>([])

  useEffect(() => {
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 2
    }))
    setParticles(newParticles)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute bg-primary-500/20 rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
          }}
          animate={{
            y: [0, -15, 0],
            opacity: [0.2, 0.6, 0.2],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            repeat: 999,
            delay: particle.delay,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  )
}

// Componente de produto
const ProductCard = ({ 
  product, 
  index
}: { 
  product: any; 
  index: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className="group bg-dark-900/80 border border-dark-700 rounded-2xl overflow-hidden hover:border-primary-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/10"
  >
    {/* Imagem do produto */}
    <div className="relative aspect-square overflow-hidden bg-dark-800">
      <Image
        src={product.image || '/images/Logo.png'}
        alt={product.name}
        fill
        className="object-cover group-hover:scale-110 transition-transform duration-500"
        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
      />
      
      {/* Ações rápidas */}
      <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Link 
          href={`/produto/${product.slug}`}
          className="w-8 h-8 bg-dark-900/80 hover:bg-primary-500 rounded-full flex items-center justify-center text-white transition-colors duration-200"
        >
          <Eye size={16} />
        </Link>
      </div>
    </div>

    {/* Informações do produto */}
    <div className="p-4">
      {/* Nome do produto */}
      <div className="mb-3">
        <h3 className="font-semibold text-white group-hover:text-primary-400 transition-colors duration-200 line-clamp-2 mb-1">
          {product.name}
        </h3>
      </div>

      {/* Preços */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg font-bold text-primary-400">
          R$ {formatPrice(product.price)}
        </span>
        {product.original_price && parseFloat(product.original_price.toString()) > parseFloat(product.price.toString()) && (
          <span className="text-sm text-gray-500 line-through">
            R$ {formatPrice(product.original_price)}
          </span>
        )}
      </div>

      {/* Botão de ação */}
      <Link
        href={`/produto/${product.slug}`}
        className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group-hover:scale-105"
      >
        <ShoppingCart size={18} />
        Ver Produto
        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
      </Link>
    </div>
  </motion.div>
)

// Componente de skeleton
const ProductSkeleton = () => (
  <div className="bg-dark-900/80 border border-dark-700 rounded-2xl overflow-hidden animate-pulse">
    <div className="aspect-square bg-dark-800" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-dark-800 rounded w-3/4" />
      <div className="h-3 bg-dark-800 rounded w-1/2" />
      <div className="h-5 bg-dark-800 rounded w-1/3" />
      <div className="h-4 bg-dark-800 rounded w-1/2" />
      <div className="h-12 bg-dark-800 rounded-xl w-full" />
    </div>
  </div>
)

// Componente principal de pesquisa
function SearchContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('relevance')
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    brand: '',
    category: ''
  })
  const [showSizeModal, setShowSizeModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [selectedSize, setSelectedSize] = useState('')

  // Buscar produtos
  useEffect(() => {
    const fetchProducts = async () => {
      if (query.trim()) {
        setLoading(true)
        try {
          const response = await fetch(`/api/products/search?q=${encodeURIComponent(query.trim())}`)
          const data = await response.json()
          
          if (data.success) {
            setProducts(data.data)
          } else {
            setProducts([])
          }
        } catch (error) {
          console.error('Erro na busca:', error)
          setProducts([])
        } finally {
          setLoading(false)
        }
      }
    }

    fetchProducts()
  }, [query])

  // Filtrar e ordenar produtos
  const filteredProducts = products.filter(product => {
    if (filters.minPrice && product.price < parseFloat(filters.minPrice)) return false
    if (filters.maxPrice && product.price > parseFloat(filters.maxPrice)) return false
    if (filters.brand && product.brand_name !== filters.brand) return false
    if (filters.category && product.category_name !== filters.category) return false
    return true
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price_asc':
        return a.price - b.price
      case 'price_desc':
        return b.price - a.price
      case 'name':
        return a.name.localeCompare(b.name)
      case 'rating':
        return (b.rating || 0) - (a.rating || 0)
      default:
        return 0
    }
  })

  // Se não há query, mostrar página inicial
  if (!query.trim()) {
    return (
      <div className="min-h-screen bg-dark-950 relative flex items-center justify-center overflow-hidden">
        <FloatingParticles />
        
        <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-dark-950 to-black opacity-80" />
        
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 text-center px-4 max-w-2xl">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
            className="mb-8 flex justify-center"
          >
            <div className="p-6 bg-primary-500/10 rounded-full border border-primary-500/20">
              <MagnifyingGlass size={64} className="text-primary-400" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            Pesquisa de Produtos
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed"
          >
            Digite o que você procura na barra de pesquisa para encontrar os melhores tênis!
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link
              href="/"
              className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-primary-500/25"
            >
              <Package size={20} />
              Ver Todos os Produtos
            </Link>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-950 relative">
      <FloatingParticles />
      
      {/* Header da pesquisa */}
      <div className="relative z-10 pt-24 pb-8">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Resultados para: <span className="text-primary-400">&quot;{query}&quot;</span>
            </h1>
            <p className="text-gray-300">
              {loading ? 'Buscando produtos...' : `${sortedProducts.length} produto(s) encontrado(s)`}
            </p>
          </motion.div>

          {/* Controles de filtro e ordenação */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-dark-900/50 border border-dark-700 rounded-2xl p-4 mb-8"
          >
            {/* Desktop Layout */}
            <div className="hidden lg:flex flex-row gap-4 items-center justify-between">
              {/* Filtros */}
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Funnel size={20} className="text-primary-400" />
                  <span className="text-white font-medium">Filtros:</span>
                </div>
                
                <input
                  type="number"
                  placeholder="Preço min"
                  value={filters.minPrice}
                  onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                  className="bg-dark-800 border border-dark-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-primary-500 focus:outline-none w-32 text-center"
                />
                
                <input
                  type="number"
                  placeholder="Preço max"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                  className="bg-dark-800 border border-dark-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-primary-500 focus:outline-none w-32 text-center"
                />
              </div>

              {/* Ordenação e visualização */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <ArrowsDownUp size={20} className="text-primary-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-white focus:border-primary-500 focus:outline-none"
                  >
                    <option value="relevance">Mais Relevantes</option>
                    <option value="price_asc">Menor Preço</option>
                    <option value="price_desc">Maior Preço</option>
                    <option value="name">Nome A-Z</option>
                    <option value="rating">Melhor Avaliados</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors duration-200 ${
                      viewMode === 'grid' 
                        ? 'bg-primary-500 text-white' 
                        : 'bg-dark-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    <Square size={20} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors duration-200 ${
                      viewMode === 'list' 
                        ? 'bg-primary-500 text-white' 
                        : 'bg-dark-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    <List size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Layout */}
            <div className="lg:hidden space-y-4">
              {/* Header dos Filtros */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary-500/20 rounded-full flex items-center justify-center">
                    <Funnel size={18} className="text-primary-400" />
                  </div>
                  <span className="text-white font-semibold text-lg">Filtros e Ordenação</span>
                </div>
              </div>

              {/* Filtros de Preço - Mobile */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-gray-300 text-sm font-medium">Faixa de Preço:</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="Preço min"
                      value={filters.minPrice}
                      onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                      className="w-full bg-dark-800 border-2 border-dark-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-primary-500 focus:outline-none text-center font-medium"
                    />
                    <div className="absolute inset-y-0 right-3 flex items-center">
                      <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="Preço max"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                      className="w-full bg-dark-800 border-2 border-dark-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-primary-500 focus:outline-none text-center font-medium"
                    />
                    <div className="absolute inset-y-0 right-3 flex items-center">
                      <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ordenação - Mobile */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary-500/20 rounded-full flex items-center justify-center">
                    <ArrowsDownUp size={18} className="text-primary-400" />
                  </div>
                  <span className="text-gray-300 text-sm font-medium">Ordenar por:</span>
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-dark-800 border-2 border-dark-600 rounded-xl px-4 py-3 text-white focus:border-primary-500 focus:outline-none font-medium"
                >
                  <option value="relevance">Mais Relevantes</option>
                  <option value="price_asc">Menor Preço</option>
                  <option value="price_desc">Maior Preço</option>
                  <option value="name">Nome A-Z</option>
                  <option value="rating">Melhor Avaliados</option>
                </select>
              </div>

              {/* Visualização - Mobile */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-gray-300 text-sm font-medium">Visualização:</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex-1 py-3 px-4 rounded-xl transition-all duration-200 font-medium ${
                      viewMode === 'grid' 
                        ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25' 
                        : 'bg-dark-800 text-gray-400 hover:text-white hover:bg-dark-700'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Square size={18} />
                      <span className="text-sm">Grade</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex-1 py-3 px-4 rounded-xl transition-all duration-200 font-medium ${
                      viewMode === 'list' 
                        ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25' 
                        : 'bg-dark-800 text-gray-400 hover:text-white hover:bg-dark-700'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <List size={18} />
                      <span className="text-sm">Lista</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Resultados da pesquisa */}
      <div className="relative z-10 pb-16">
        <div className="container mx-auto px-4">
          {loading ? (
            // Skeleton loading
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {[...Array(8)].map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : sortedProducts.length > 0 ? (
            // Produtos encontrados
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                  : 'grid-cols-1'
              }`}
            >
              <AnimatePresence>
                {sortedProducts.map((product, index) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    index={index} 
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            // Nenhum produto encontrado
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="p-8 bg-dark-900/50 border border-dark-700 rounded-2xl max-w-md mx-auto">
                <Package size={64} className="mx-auto mb-4 text-gray-500" />
                <h3 className="text-xl font-semibold text-white mb-2">Nenhum produto encontrado</h3>
                <p className="text-gray-400 mb-6">
                  Não encontramos produtos para &quot;{query}&quot;. Tente outros termos ou explore nossa coleção completa.
                </p>
                <Link
                  href="/produtos"
                  className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors duration-200"
                >
                  Ver Todos os Produtos
                  <ArrowRight size={16} />
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Efeito de brilho que se move */}
      <motion.div
        className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-500/50 to-transparent"
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 4, repeat: 999, ease: "linear" }}
      />

      {/* Modal de Seleção de Tamanho */}
      <AnimatePresence>
        {showSizeModal && selectedProduct && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-dark-900 border border-dark-700 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4"
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.22 }}
            >
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-white mb-2">Escolha o Tamanho</h2>
                <p className="text-gray-300">{selectedProduct.name}</p>
              </div>

              {/* Tamanhos disponíveis */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {['36', '37', '38', '39', '40', '41', '42', '43', '44'].map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`p-3 rounded-lg border transition-all duration-200 ${
                      selectedSize === size
                        ? 'border-primary-500 bg-primary-500/20 text-primary-400'
                        : 'border-dark-600 text-gray-300 hover:border-primary-500/50 hover:bg-dark-800'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>

              {/* Botões de ação */}
              <div className="flex gap-3">
                <button
                  className="flex-1 px-6 py-3 rounded-lg bg-dark-800 text-gray-300 border border-dark-700 hover:bg-dark-700 transition-colors font-semibold"
                  onClick={() => {
                    setShowSizeModal(false)
                    setSelectedProduct(null)
                    setSelectedSize('')
                  }}
                >
                  Cancelar
                </button>
                <button
                  className="flex-1 px-6 py-3 rounded-lg bg-primary-500 text-white font-bold hover:bg-primary-600 transition-colors disabled:bg-dark-700 disabled:cursor-not-allowed"
                  disabled={!selectedSize}
                  onClick={() => {
                    if (selectedSize) {
                      // Aqui você pode adicionar a lógica para adicionar ao carrinho
                      alert(`Produto ${selectedProduct.name} - Tamanho ${selectedSize} adicionado ao carrinho!`)
                      setShowSizeModal(false)
                      setSelectedProduct(null)
                      setSelectedSize('')
                    }
                  }}
                >
                  Adicionar ao Carrinho
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Componente principal com Suspense
export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Carregando...</p>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}
