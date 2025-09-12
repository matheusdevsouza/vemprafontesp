'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { LightningIcon, HeartIcon, FireIcon, TrophyIcon, StarIcon, SneakerIcon, BasketballIcon, PlayCircleIcon } from '@phosphor-icons/react'
import { useGSAP } from '@/hooks/useGSAP'

interface Category {
  id: number
  name: string
  slug: string
  description: string
  productCount: number
  isActive: boolean
}

const categoryIcons: { [key: string]: any } = {
  'running': LightningIcon,
  'lifestyle': HeartIcon,
  'basketball': BasketballIcon,
  'training': FireIcon,
  'skateboarding': PlayCircleIcon,
  'casual': SneakerIcon,
  'edicao-limitada': StarIcon,
  'performance': TrophyIcon,
  'air-max': LightningIcon 
}

const categoryGradients: { [key: string]: string } = {
  'running': 'from-blue-500 to-blue-700',
  'lifestyle': 'from-pink-500 to-rose-600',
  'basketball': 'from-orange-500 to-red-600',
  'training': 'from-yellow-500 to-orange-600',
  'skateboarding': 'from-purple-500 to-indigo-600',
  'casual': 'from-green-500 to-emerald-600',
  'edicao-limitada': 'from-amber-500 to-yellow-600',
  'performance': 'from-cyan-500 to-blue-600',
  'air-max': 'from-red-500 to-pink-600' 
}

export function CategoriesSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const { scrollAnimation } = useGSAP()

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/categories')
        const data = await response.json()
        
        if (data.success) {
          setCategories(data.data)
        }
      } catch (error) {
        console.error('Erro ao buscar categorias:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  useEffect(() => {
    if (sectionRef.current && !loading) {
      scrollAnimation(sectionRef.current, {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.15
      })
    }
  }, [scrollAnimation, loading])

  const getCategoryBadge = (category: Category) => {
    if (category.productCount > 20) return { text: 'POPULAR', color: 'bg-green-500' }
    if (category.slug === 'training') return { text: 'HOT', color: 'bg-red-500' }
    if (category.slug === 'edicao-limitada') return { text: 'LIMITED', color: 'bg-yellow-500 text-black' }
    return null
  }

  if (loading) {
    return (
      <section ref={sectionRef} className="py-24 bg-dark-950 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="gradient-text">Categorias</span> de Tênis
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Encontre o tênis perfeito para cada atividade
            </p>
          </motion.div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        </div>
      </section>
    )
  }

  if (!categories.length) {
    return (
      <section ref={sectionRef} className="py-24 bg-dark-950 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="gradient-text">Categorias</span> de Tênis
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Encontre o tênis perfeito para cada atividade
            </p>
          </motion.div>
          <div className="text-center text-gray-400">
            <p>Nenhuma categoria encontrada.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section ref={sectionRef} className="py-24 bg-dark-950 relative overflow-hidden">
      {/* Background decorativo */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Cabeçalho */}
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
            className="inline-block bg-primary-500/20 text-primary-400 px-6 py-2 rounded-full text-sm font-semibold mb-6"
          >
            EXPLORE CATEGORIAS
          </motion.span>
          
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="gradient-text">Categorias</span> de Tênis
          </h2>
          
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Encontre o tênis perfeito para cada atividade. 
            Desde corrida profissional até uso casual, temos a categoria ideal para você.
          </p>
        </motion.div>

        {/* Grid de Categorias */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => {
            const IconComponent = categoryIcons[category.slug] || SneakerIcon
            const gradient = categoryGradients[category.slug] || 'from-gray-500 to-gray-700'
            const badge = getCategoryBadge(category)
            
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ 
                  y: -10, 
                  scale: 1.02,
                  rotateY: 5 
                }}
                className="group relative"
              >
                {/* Badges */}
                {badge && (
                  <div className="absolute -top-2 -right-2 z-20">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${badge.color} text-white`}>
                      {badge.text}
                    </span>
                  </div>
                )}

                {/* Card */}
                <div className={`relative h-64 rounded-3xl overflow-hidden bg-gradient-to-br ${gradient} p-6 cursor-pointer transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-primary-500/20`}>
                  {/* Efeito de brilho */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform group-hover:translate-x-full" 
                       style={{ transform: 'translateX(-100%)' }} />
                  
                  {/* Background pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-4 right-4 w-20 h-20 border border-white/20 rounded-full" />
                    <div className="absolute bottom-4 left-4 w-16 h-16 border border-white/15 rounded-full" />
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-white/10 rounded-full" />
                  </div>

                  {/* Conteúdo */}
                  <div className="relative z-10 flex flex-col justify-between h-full text-white">
                    <div>
                      {/* Ícone */}
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm"
                      >
                        <IconComponent size={24} className="text-white" />
                      </motion.div>

                      {/* Nome da categoria */}
                      <h3 className="text-xl font-bold mb-2">
                        {category.name}
                      </h3>

                      {/* Descrição */}
                      <p className="text-white/80 text-sm leading-relaxed">
                        {category.description}
                      </p>
                    </div>

                    {/* Contador */}
                    <div className="flex items-center justify-between">
                      <span className="text-white/90 font-semibold text-sm">
                        {category.productCount}+ modelos
                      </span>
                      
                      <motion.div
                        whileHover={{ x: 5 }}
                        className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"
                      >
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mt-16"
        >
          <button className="bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95">
            Ver Todos os Produtos
          </button>
        </motion.div>
      </div>
    </section>
  )
} 