'use client'

import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { CaretLeft, CaretRight } from 'phosphor-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Link from "next/link";

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface Product {
  id: string
  name: string
  image: string
  price: number
  originalPrice?: number
  sizes: string[]
  badge?: string
  badgeColor?: string
  slug: string;
}

const MizunoSkeleton = () => (
  <div className="group relative flex-shrink-0 w-64">
    <div className="relative w-full h-64 rounded-2xl overflow-hidden mb-4 bg-gray-800">
      <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-shimmer"></div>
    </div>

    <div className="text-center">
      <div className="mb-2 min-h-[3rem] flex flex-col gap-2">
        <div className="h-5 bg-gray-800 rounded-md relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-shimmer"></div>
        </div>
        <div className="h-5 bg-gray-800 rounded-md w-3/4 mx-auto relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-shimmer"></div>
        </div>
      </div>

      <div className="mb-4">
        <div className="mb-3 flex items-center justify-center gap-2">
          <div className="h-6 w-24 bg-gray-800 rounded-md relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-shimmer"></div>
          </div>
          <div className="h-4 w-16 bg-gray-800 rounded-md relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-shimmer"></div>
          </div>
        </div>

        <div className="h-4 w-32 bg-gray-800 rounded-md mx-auto relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-shimmer"></div>
        </div>
      </div>

      <div className="w-full h-10 bg-gray-800 rounded-full relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-shimmer"></div>
      </div>
    </div>
  </div>
)

export function MizunoProphecy7Section() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const sliderRef = useRef<HTMLDivElement>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const itemsPerPage = isMobile ? 1 : 5

  // Detectar se é mobile e atualizar quando a tela mudar
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/products?subcategory_id=4')
        const data = await response.json()
        
        if (data.success) {
          setProducts(data.data)
        }
      } catch (error) {
        console.error('Erro ao buscar produtos Prophecy 7:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
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
      
      if (isMobile) {
        gsap.to(sliderRef.current, {
          x: `${-newPage * 280}px`,
          duration: 0.8,
          ease: "power2.out"
        })
      } else {
        gsap.to(sliderRef.current, {
          x: `${-newPage * (itemsPerPage * 280)}px`,
          duration: 0.8,
          ease: "power2.out"
        })
      }
    }
  }

  const slideRight = () => {
    if (sliderRef.current && currentPage < Math.floor((products.length - 1) / itemsPerPage)) {
      const newPage = currentPage + 1
      setCurrentPage(newPage)
      
      if (isMobile) {
        gsap.to(sliderRef.current, {
          x: `${-newPage * 280}px`,
          duration: 0.8,
          ease: "power2.out"
        })
      } else {
        gsap.to(sliderRef.current, {
          x: `${-newPage * (itemsPerPage * 280)}px`,
          duration: 0.8,
          ease: "power2.out"
        })
      }
    }
  }

  const formatPrice = (price: number) => {
    return `R$ ${price.toLocaleString('pt-BR', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`
  }

  const calculateInstallments = (price: number) => {
    return `R$ ${(price / 12).toLocaleString('pt-BR', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`
  }

  if (loading) {
    return (
      <section ref={sectionRef} className="py-24 bg-dark-950 overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Prophecy 7</h2>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
              Evolução da tecnologia Infinity Wave com design aprimorado
            </p>
          </motion.div>
          
          {/* Skeleton Loading */}
          <div className="max-w-[1400px] mx-auto overflow-hidden">
            <div className="flex gap-6 pb-8 justify-center">
              {[...Array(5)].map((_, index) => (
                <MizunoSkeleton key={index} />
              ))}
            </div>
            
            {/* Skeleton dos botões de navegação */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <div className="w-12 h-12 rounded-full bg-gray-800 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-shimmer"></div>
              </div>
              <div className="w-12 h-12 rounded-full bg-gray-800 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-shimmer"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (!products.length) {
    return (
      <section ref={sectionRef} className="py-24 bg-dark-950 overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Prophecy 7</h2>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
              Evolução da tecnologia Infinity Wave com design aprimorado
            </p>
          </motion.div>
          <div className="text-center text-gray-400">
            <p>Nenhum produto encontrado nesta categoria.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section ref={sectionRef} className="py-24 bg-dark-950 overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Prophecy 7</h2>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
            Evolução da tecnologia Infinity Wave com design aprimorado
          </p>
        </motion.div>

        <div className="max-w-[1400px] mx-auto overflow-hidden">
          {/* Botões de Navegação */}
          <div className="absolute top-1/2 -translate-y-1/2 -left-16">
            <button
              onClick={slideLeft}
              disabled={currentPage === 0}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-gray-300 transition-all duration-300 ${
                currentPage === 0 
                ? 'bg-dark-800/40 cursor-not-allowed' 
                : 'bg-dark-800/80 hover:bg-primary-500 hover:text-white'
              }`}
            >
              <CaretLeft size={20} />
            </button>
          </div>

          <div
            ref={sliderRef}
            className="flex gap-6 pb-8 select-none"
            style={{
              willChange: 'transform',
              transform: 'translate3d(0, 0, 0)'
            }}
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="group relative flex-shrink-0 w-64"
              >
                <div className="bg-dark-800/80 border border-dark-700 rounded-2xl overflow-hidden hover:border-primary-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/10">
                  {/* Imagem do Produto */}
                  <div className="relative aspect-square overflow-hidden bg-dark-800">
                    <Link href={`/produto/${product.slug}`} className="block w-full h-full">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="256px"
                        className="object-cover group-hover:scale-110 transition-transform duration-200"
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
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <span className="text-lg font-bold text-primary-400">
                        {formatPrice(product.price)}
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>

                    {/* Parcelamento */}
                    <div className="mb-4 text-center">
                      <span className="text-sm text-gray-400">
                        ou 12x de {calculateInstallments(product.price)}
                      </span>
                    </div>

                    {/* Botão Ver Produto */}
                    <Link
                      href={`/produto/${product.slug}`}
                      className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group-hover:scale-105"
                    >
                      Ver Produto
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Setas Embaixo */}
          {Math.floor((products.length - 1) / itemsPerPage) > 0 && (
            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={slideLeft}
                disabled={currentPage === 0}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-gray-300 transition-all duration-300 ${
                  currentPage === 0 
                  ? 'bg-dark-800/40 cursor-not-allowed' 
                  : 'bg-dark-800/80 hover:bg-primary-500 hover:text-white'
                }`}
              >
                <CaretLeft size={24} weight="bold" />
              </button>

              <button
                onClick={slideRight}
                disabled={currentPage >= Math.floor((products.length - 1) / itemsPerPage)}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-gray-300 transition-all duration-300 ${
                  currentPage >= Math.floor((products.length - 1) / itemsPerPage)
                  ? 'bg-dark-800/40 cursor-not-allowed' 
                  : 'bg-dark-800/80 hover:bg-primary-500 hover:text-white'
                }`}
              >
                <CaretRight size={24} weight="bold" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
} 
