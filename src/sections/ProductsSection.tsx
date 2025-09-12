'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Heart, Eye, ShoppingCart, Lightning, Fire } from 'phosphor-react'
import { formatPrice, getImageUrl } from '@/lib/utils'
import { useGSAP } from '@/hooks/useGSAP'
import { useCart } from '@/contexts/CartContext'
import Link from 'next/link'

export function ProductsSection() {
  const [activeFilter, setActiveFilter] = useState('todos')
  const [favorites, setFavorites] = useState<string[]>([])
  const [products, setProducts] = useState<any[]>([])

  const [loading, setLoading] = useState(true)
  const sectionRef = useRef<HTMLDivElement>(null)
  const { scrollAnimation } = useGSAP()
  const { addItem } = useCart()

  useEffect(() => {
    if (sectionRef.current) {
      scrollAnimation(sectionRef.current, {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.1
      })
    }
  }, [scrollAnimation])

  useEffect(() => {
    const fetchData = async () => {
      try {

        const productsResponse = await fetch('/api/products?limit=8&featured=true')
        const productsData = await productsResponse.json()
        
        if (productsData.success) {
          setProducts(productsData.data)
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  const filters = [
    { id: 'todos', label: 'Todos', count: products.length }
  ]

  const filteredProducts = activeFilter === 'todos' 
    ? products 
    : products.filter(product => 
        product.brand.toLowerCase() === activeFilter || 
        product.brand.toLowerCase().includes(activeFilter)
      )

  const toggleFavorite = (productId: string) => {
    setFavorites(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const calculateDiscount = (original: number, current: number) => {
    return Math.round(((original - current) / original) * 100)
  }

  return (
    <section ref={sectionRef} className="py-24 bg-dark-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-primary-500/20 border border-primary-500/30 rounded-full px-6 py-3 mb-8"
          >
            <Lightning size={20} className="text-primary-500" weight="fill" />
            <span className="text-sm font-medium text-primary-400">
              Só os mais pedidos
            </span>
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            Os Tn&apos;s Mais Procurados
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto"
          >
            Confira os modelos que estão bombando. Garanta já o seu!
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {filters.map((filter) => (
            <motion.button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                activeFilter === filter.id
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                  : 'bg-dark-800/50 text-gray-400 hover:bg-dark-700 hover:text-white border border-dark-700'
              }`}
            >
              {filter.label}
              <span className="ml-2 text-xs opacity-75">({filter.count})</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Grid de Produtos */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-2xl font-bold text-white mb-4">Nenhum produto encontrado</h3>
            <p className="text-gray-400">Tente selecionar outro filtro ou volte mais tarde.</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFilter}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            >
            {filteredProducts.map((product, index) => {
              const discount = product.originalPrice 
                ? calculateDiscount(product.originalPrice, product.price)
                : 0

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="group bg-dark-800/80 border border-dark-700 rounded-2xl overflow-hidden hover:border-primary-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/10"
                >
                  {/* Imagem do Produto */}
                  <div className="relative aspect-square overflow-hidden bg-dark-800">
                    <Link href={`/produto/${product.slug}`} className="block w-full h-full">
                      <motion.img
                        src={product.primary_image || (product.images && product.images[0]?.url) || '/images/Logo.png'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                        whileHover={{ scale: 1.1 }}
                      />
                    </Link>
                  </div>

                  {/* Informações do Produto */}
                  <div className="p-4">
                    {/* Nome do Produto */}
                    <div className="mb-3 h-12 flex flex-col items-center justify-center">
                      <Link href={`/produto/${product.slug}`}>
                        <h3 className="font-semibold text-white group-hover:text-primary-400 transition-colors duration-200 text-center leading-tight">
                          {product.name.split('"').length > 1 ? (
                            <>
                              <span className="block text-sm text-gray-300 mb-1">
                                {product.name.split('"')[0].trim()}
                              </span>
                              <span className="block text-lg">
                                &quot;{product.name.split('"')[1]}&quot;
                              </span>
                            </>
                          ) : (
                            product.name
                          )}
                        </h3>
                      </Link>
                    </div>

                    {/* Preços */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg font-bold text-primary-400">
                        {formatPrice(product.price)}
                      </span>
                      {product.originalPrice && parseFloat(product.originalPrice.toString()) > parseFloat(product.price.toString()) && (
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>

                    {/* Parcelamento */}
                    <div className="mb-4">
                      <span className="text-sm text-gray-400">
                        ou 12x de {formatPrice(product.price / 12)}
                      </span>
                    </div>

                    {/* Botão Ver Produto */}
                    <Link
                      href={`/produto/${product.slug}`}
                      className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group-hover:scale-105"
                    >
                      <ShoppingCart size={18} />
                      Ver Produto
                    </Link>
                  </div>
                </motion.div>
              )
              })}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mt-16"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-10 py-4 rounded-full font-semibold text-lg shadow-2xl hover:shadow-primary-500/25 transition-all duration-300"
          >
            Ver Todos os Produtos
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
} 