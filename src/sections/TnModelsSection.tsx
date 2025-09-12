'use client'

import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useGSAP } from '@/hooks/useGSAP'
import { CaretLeft, CaretRight } from 'phosphor-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface Model {
  id: number
  name: string
  slug: string
  description: string
  image_url: string
  sort_order: number
}

// Componente Skeleton para TN Models (circular)
const TnModelSkeleton = () => (
  <div className="group relative flex-shrink-0 w-28 md:w-48">
    {/* Círculo decorativo skeleton */}
    <div className="absolute -inset-1 bg-gray-800 rounded-full blur-md opacity-60 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-shimmer"></div>
    </div>

    {/* Container da imagem circular skeleton */}
    <div className="relative w-20 h-20 md:w-32 md:h-32 mx-auto rounded-full overflow-hidden border-2 border-gray-700 bg-gray-800">
      <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-shimmer"></div>
    </div>

    {/* Nome do modelo skeleton */}
    <div className="text-center mt-2 md:mt-3">
      <div className="h-3 md:h-4 w-16 md:w-32 bg-gray-800 rounded-md mx-auto relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-shimmer"></div>
      </div>
    </div>
  </div>
)

export function TnModelsSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const sliderRef = useRef<HTMLDivElement>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [models, setModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const { scrollAnimation } = useGSAP()

  // Detectar se é mobile e atualizar quando a tela mudar
  useEffect(() => {
    const checkIsMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
    }
    
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  // Buscar modelos da API
  useEffect(() => {
    const fetchModels = async () => {
      try {
        setLoading(true)
        
        const response = await fetch('/api/models')
        const data = await response.json()
        
        if (data.success) {
          setModels(data.data)
        }
      } catch (error) {
        console.error('Erro ao buscar modelos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchModels()
  }, [])

  useEffect(() => {
    const slider = sliderRef.current
    const slides = slider?.children
    if (!slider || !slides || loading) return

    gsap.set(slides, {
      opacity: 0,
      scale: 0.8,
      y: 50
    })

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top center+=100",
        once: true
      }
    })

    tl.to(slides, {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: "back.out(1.2)"
    })

    return () => {
      if (tl.scrollTrigger) {
        tl.scrollTrigger.kill()
      }
    }
  }, [loading])

  // Função para dividir modelos em páginas
  const getModelPages = () => {
    const pages = []
    const itemsPerPage = isMobile ? 3 : 6
    
    for (let i = 0; i < models.length; i += itemsPerPage) {
      const page = models.slice(i, i + itemsPerPage)
      pages.push(page)
    }
    
    return pages
  }

  const modelPages = getModelPages()
  const totalPages = modelPages.length

  // Resetar para primeira página quando mudar entre mobile/desktop
  useEffect(() => {
    setCurrentPage(0)
    if (sliderRef.current) {
      gsap.set(sliderRef.current, { x: 0 })
    }
  }, [isMobile])

  const slideLeft = () => {
    if (sliderRef.current && currentPage > 0) {
      const newPage = currentPage - 1
      setCurrentPage(newPage)
      
      const transformX = -newPage * (100 / totalPages)
      
      gsap.to(sliderRef.current, {
        x: `${transformX}%`,
        duration: 0.8,
        ease: "power2.out"
      })
    }
  }

  const slideRight = () => {
    if (sliderRef.current && currentPage < totalPages - 1) {
      const newPage = currentPage + 1
      setCurrentPage(newPage)
      
      const transformX = -newPage * (100 / totalPages)
      
      gsap.to(sliderRef.current, {
        x: `${transformX}%`,
        duration: 0.8,
        ease: "power2.out"
      })
    }
  }

  // Loading state com skeleton
  if (loading) {
    return (
      <section ref={sectionRef} className="py-12 sm:py-16 md:py-20 lg:py-24 bg-dark-900 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12 md:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 md:mb-6">Modelos</h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-400 max-w-lg sm:max-w-xl md:max-w-2xl mx-auto px-4">
              Escolha seu produto favorito entre nossa seleção especial!
            </p>
          </motion.div>

          {/* Skeleton Loading */}
          <div className="relative">
            {/* Skeleton Desktop */}
            <div className="hidden md:block">
              <div className="overflow-hidden">
                <div className="flex gap-6 pb-8 justify-center">
                  {[...Array(6)].map((_, index) => (
                    <TnModelSkeleton key={index} />
                  ))}
                </div>
              </div>
            </div>

            {/* Skeleton Mobile */}
            <div className="md:hidden">
              <div className="overflow-hidden">
                <div className="grid grid-cols-3 gap-3 pb-6 justify-items-center">
                  {[...Array(3)].map((_, index) => (
                    <TnModelSkeleton key={index} />
                  ))}
                </div>
              </div>
            </div>

            {/* Skeleton Setas Embaixo */}
            <div className="flex justify-center gap-3 sm:gap-4 mt-6 sm:mt-8">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-800 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-shimmer"></div>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-800 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-shimmer"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Empty state
  if (!models.length) {
    return (
      <section ref={sectionRef} className="py-12 sm:py-16 md:py-20 lg:py-24 bg-dark-900 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12 md:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 md:mb-6">Modelos</h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-400 max-w-lg sm:max-w-xl md:max-w-2xl mx-auto px-4">
              Escolha seu produto favorito entre nossa seleção especial!
            </p>
          </motion.div>
          <div className="text-center text-gray-400 px-4">
            <p className="text-sm sm:text-base">Nenhum modelo encontrado.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section ref={sectionRef} className="py-12 sm:py-16 md:py-20 lg:py-24 bg-dark-900 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Título da Seção */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12 md:mb-16"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 md:mb-6"
          >
            Modelos
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-400 max-w-lg sm:max-w-xl md:max-w-2xl mx-auto px-4"
          >
            Escolha seu produto favorito entre nossa seleção especial!
          </motion.p>
        </motion.div>

        {/* Container Principal dos Modelos */}
        <div className="relative">
          <div className="overflow-hidden">
            <div
              ref={sliderRef}
              className="flex"
              style={{
                width: `${totalPages * 100}%`,
                willChange: 'transform',
                transform: 'translate3d(0, 0, 0)'
              }}
            >
              {modelPages.map((page, pageIndex) => (
                <div
                  key={pageIndex}
                  className="w-full flex-shrink-0"
                  style={{ width: `${100 / totalPages}%` }}
                >
                  {/* Desktop Layout */}
                  <div className="hidden md:block">
                    <div className={`flex gap-6 pb-8 ${page.length === 6 ? 'justify-center' : 'justify-start'}`}>
                      {page.map((model) => (
                        <Link
                          key={model.id}
                          href={`/modelos/${model.slug}`}
                          className="group relative cursor-pointer w-48 flex-shrink-0"
                        >
                          {/* Container da imagem */}
                          <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden border-2 border-transparent group-hover:border-primary-500/50 transition-all duration-500 bg-dark-800/50">
                            {model.image_url ? (
                              <Image
                                src={model.image_url}
                                alt={model.name}
                                fill
                                sizes="128px"
                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                              />
                            ) : (
                              /* Fallback para quando não há imagem */
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-500/20 to-primary-600/20">
                                <span className="text-primary-400 font-bold text-2xl">
                                  {model.name.charAt(0)}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Nome do modelo */}
                          <div className="text-center mt-3">
                            <h3 className="text-base font-semibold text-white group-hover:text-primary-400 transition-colors duration-500 line-clamp-2 max-w-40 mx-auto px-1 leading-tight"> 
                              {model.name}
                            </h3>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Mobile Layout */}
                  <div className="md:hidden">
                    <div className="grid grid-cols-3 gap-3 pb-6 justify-items-center">
                      {page.map((model) => (
                        <Link
                          key={model.id}
                          href={`/modelos/${model.slug}`}
                          className="group relative cursor-pointer w-28"
                        >
                          {/* Container da imagem */}
                          <div className="relative w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-transparent group-hover:border-primary-500/50 transition-all duration-500 bg-dark-800/50">
                            {model.image_url ? (
                              <Image
                                src={model.image_url}
                                alt={model.name}
                                fill
                                sizes="80px"
                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                              />
                            ) : (
                              /* Fallback para quando não há imagem */
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-500/20 to-primary-600/20">
                                <span className="text-primary-400 font-bold text-lg">
                                  {model.name.charAt(0)}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Nome do modelo */}
                          <div className="text-center mt-2">
                            <h3 className="text-xs font-semibold text-white group-hover:text-primary-400 transition-colors duration-500 line-clamp-2 max-w-24 mx-auto px-1 leading-tight"> 
                              {model.name}
                            </h3>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Setas Embaixo */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-3 sm:gap-4 mt-6 sm:mt-8">
              <button
                onClick={slideLeft}
                disabled={currentPage === 0}
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-gray-300 transition-all duration-300 ${
                  currentPage === 0
                  ? 'bg-dark-800/40 cursor-not-allowed'
                  : 'bg-dark-800/80 hover:bg-primary-500 hover:text-white'
                }`}
              >
                <CaretLeft size={20} className="sm:w-6 sm:h-6" weight="bold" />
              </button>

              <button
                onClick={slideRight}
                disabled={currentPage >= totalPages - 1}
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-gray-300 transition-all duration-300 ${
                  currentPage >= totalPages - 1
                  ? 'bg-dark-800/40 cursor-not-allowed'
                  : 'bg-dark-800/80 hover:bg-primary-500 hover:text-white'
                }`}
              >
                <CaretRight size={20} className="sm:w-6 sm:h-6" weight="bold" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
