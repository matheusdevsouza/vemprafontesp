'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Image from 'next/image'

interface Model {
  id: number
  name: string
  slug: string
  description: string
  image_url: string
}

interface Product {
  id: number
  name: string
  slug: string
  price: number
  primary_image: string
  color: string
  brand_name: string
  category_name: string
  subcategory_name: string
  is_new: boolean
  is_featured: boolean
  is_bestseller: boolean
  original_price: number
  stock_quantity: number
}

export default function ModelPage() {
  const params = useParams()
  const slug = params.slug as string
  const [model, setModel] = useState<Model | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [filtered, setFiltered] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ cor: '', preco: [0, 9999], order: '' })
  const [precoMin, setPrecoMin] = useState(0)
  const [precoMax, setPrecoMax] = useState(9999)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const resModel = await fetch(`/api/models/${slug}`)
      const dataModel = await resModel.json()
      setModel(dataModel.data)
      const resProducts = await fetch(`/api/products/by-model/${slug}`)
      const dataProducts = await resProducts.json()
      // Remover duplicados pelo id
      const uniqueProducts = Array.from(new Map((dataProducts.data || []).map((p: any) => [p.id, p])).values()) as any[]
      setProducts(uniqueProducts)
      setFiltered(uniqueProducts)
      // Calcular faixa de preço
      const precos = (uniqueProducts || []).map((p: any) => p.price)
      if (precos.length) {
        setPrecoMin(Math.min(...precos))
        setPrecoMax(Math.max(...precos))
        setFilters(f => ({ ...f, preco: [Math.min(...precos), Math.max(...precos)] }))
      }
      setLoading(false)
    }
    if (slug) fetchData()
  }, [slug])

  // Filtros personalizados
  useEffect(() => {
    let result = [...products]
    if (filters.cor) result = result.filter(p => p.color === filters.cor)
    result = result.filter(p => p.price >= filters.preco[0] && p.price <= filters.preco[1])
    if (filters.order === 'price_asc') result = result.sort((a, b) => a.price - b.price)
    if (filters.order === 'price_desc') result = result.sort((a, b) => b.price - a.price)
    setFiltered(result)
  }, [filters, products])

  // Obter opções únicas
  const cores = Array.from(new Set(products.map(p => p.color))).filter(Boolean)

  return (
    <div className="min-h-screen bg-dark-900 py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Breadcrumb */}
        <nav className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
            <Link href="/" className="hover:text-white transition-colors">Início</Link>
            <span>/</span>
            <Link href="/#modelos" className="hover:text-white transition-colors">Modelos</Link>
            <span>/</span>
            <span className="text-white">{model?.name}</span>
          </div>
        </nav>

        {/* Cabeçalho do modelo */}
        {model && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.7 }} 
            className="flex flex-col md:flex-row items-center gap-6 md:gap-8 mb-8 sm:mb-12"
          >
            <div className="w-40 h-40 sm:w-48 sm:h-48 md:w-64 md:h-64 relative rounded-2xl overflow-hidden bg-dark-800 shadow-2xl">
              <Image 
                src={model.image_url} 
                alt={model.name} 
                fill 
                className="object-cover" 
                sizes="(max-width: 640px) 160px, (max-width: 768px) 192px, 256px"
                onError={(e) => {
                  // Fallback para quando a imagem não carregar
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  const fallback = target.parentElement?.querySelector('.fallback') as HTMLElement
                  if (fallback) fallback.style.display = 'flex'
                }}
              />
              {/* Fallback quando a imagem não carregar */}
              <div className="fallback hidden absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-500/20 to-primary-600/20">
                <div className="text-center">
                  <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-primary-400 mb-2">
                    {model.name.charAt(0)}
                  </div>
                  <div className="text-primary-300 text-xs sm:text-sm font-semibold">
                    {model.name}
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {model.name}
              </h1>
              <p className="text-gray-300 text-base sm:text-lg md:text-xl max-w-2xl leading-relaxed">
                {model.description}
              </p>
            </div>
          </motion.div>
        )}

        {/* Filtros personalizados */}
        <motion.aside initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-dark-800/80 border border-dark-700 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 shadow-xl flex flex-wrap gap-4 items-end">
          {/* Cor */}
          <div>
            <label className="block text-gray-300 font-semibold mb-2">Cor</label>
            <select className="w-32 rounded-lg border border-dark-700 bg-dark-900 text-gray-200 px-3 py-2" value={filters.cor} onChange={e => setFilters(f => ({ ...f, cor: e.target.value }))}>
              <option value="">Todas</option>
              {cores.map(cor => <option key={cor} value={cor}>{cor}</option>)}
            </select>
          </div>

          {/* Preço */}
          <div>
            <label className="block text-gray-300 font-semibold mb-2">Preço</label>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">R$ {precoMin}</span>
              <input type="range" min={precoMin} max={precoMax} step={10} value={filters.preco[1]} onChange={e => setFilters(f => ({ ...f, preco: [precoMin, Number(e.target.value)] }))} className="w-32 accent-primary-500" />
              <span className="text-gray-400 text-sm">R$ {precoMax}</span>
            </div>
            <div className="text-xs text-gray-400 mt-1">Até <b className="text-primary-400">R$ {filters.preco[1]}</b></div>
          </div>
          {/* Ordenação */}
          <div>
            <label className="block text-gray-300 font-semibold mb-2">Ordenar por</label>
            <select className="w-36 rounded-lg border border-dark-700 bg-dark-900 text-gray-200 px-3 py-2" value={filters.order} onChange={e => setFilters(f => ({ ...f, order: e.target.value }))}>
              <option value="">Mais relevantes</option>
              <option value="price_asc">Menor preço</option>
              <option value="price_desc">Maior preço</option>
            </select>
          </div>
        </motion.aside>

        {/* Contador de produtos */}
        {!loading && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="mb-4 sm:mb-6 text-center"
          >
            <p className="text-gray-400 text-sm sm:text-base">
              {filtered.length === products.length ? (
                `${products.length} produto(s) encontrado(s)`
              ) : (
                `${filtered.length} de ${products.length} produto(s) encontrado(s)`
              )}
            </p>
          </motion.div>
        )}

        {/* Grid de produtos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-dark-800 rounded-lg p-3 sm:p-4 animate-pulse h-48 sm:h-64" />
            ))
          ) : filtered.length === 0 ? (
            <div className="col-span-full text-center text-gray-400 py-12 sm:py-16">
              <div className="mb-4">
                <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-300 mb-2">Nenhum produto encontrado</h3>
              <p className="text-gray-500 text-sm sm:text-base">Tente ajustar os filtros ou verificar se há produtos disponíveis para este modelo.</p>
            </div>
          ) : (
            filtered.map(prod => (
              <Link key={prod.id} href={`/produto/${prod.slug}`} className="group bg-dark-800/80 rounded-2xl overflow-hidden border border-dark-700/50 hover:border-primary-500/30 transition-all duration-500 flex flex-col items-center p-3 sm:p-4 shadow-lg hover:shadow-primary-500/10">
                                  <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-2 sm:mb-3 bg-dark-900">
                  <Image src={prod.primary_image || '/images/Logo.png'} alt={prod.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 768px) 100vw, 220px" />
                  

                </div>
                
                <div className="text-center w-full">
                  <h3 className="text-base font-semibold text-white text-center group-hover:text-primary-400 transition-colors duration-300 mb-1 leading-tight h-12 flex flex-col items-center justify-center">
                    {prod.name.split('"').length > 1 ? (
                      <>
                        <span className="block text-sm text-gray-300 mb-1">
                          {prod.name.split('"')[0].trim()}
                        </span>
                        <span className="block text-base">
                          &quot;{prod.name.split('"')[1]}&quot;
                        </span>
                      </>
                    ) : (
                      prod.name
                    )}
                  </h3>
                  
                  {/* Cor */}
                  {prod.color && (
                    <div className="text-gray-400 text-xs mb-1 sm:mb-2">
                      <span className="block capitalize">{prod.color}</span>
                    </div>
                  )}
                  
                  {/* Preços */}
                  <div className="mb-2 sm:mb-3">
                    {prod.original_price && prod.original_price > prod.price ? (
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-primary-400 font-bold text-lg">
                          R$ {prod.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-gray-500 line-through text-sm">
                          R$ {prod.original_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    ) : (
                      <span className="text-primary-400 font-bold text-lg">
                        R$ {prod.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    )}
                  </div>
                  

                  
                  <button className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm transition-all duration-200 mt-auto">
                    Ver detalhes
                  </button>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
} 