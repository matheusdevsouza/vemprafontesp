'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

// Imagens do slider - PRIMEIRA IMAGEM É BANNER
const heroImages = [
  {
    id: 1,
    imageUrl: '/images/banners/banner.png',
    mobileImageUrl: '/images/banners/bannermbl.png',
    alt: 'VemPraFonteSP - Os melhores tênis - BANNER PRINCIPAL'
  },
  {
    id: 2,
    imageUrl: '/images/banners/brinde.png',
    mobileImageUrl: '/images/banners/brindembl.png',
    alt: 'Ofertas Especiais - BRINDE'
  }
]

export function HeroSection() {
  const [currentImage, setCurrentImage] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const autoPlayRef = useRef<NodeJS.Timeout>()

  // Detectar se é mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)

    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  // Auto-play do slider (5 segundos)
  useEffect(() => {
    autoPlayRef.current = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length)
    }, 5000)

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current)
      }
    }
  }, [])

  // Função para ir para uma imagem específica
  const goToImage = (index: number) => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentImage(index)
    setTimeout(() => setIsAnimating(false), 500)
  }

  const currentImageData = heroImages[currentImage]

  return (
    <section className="relative min-h-[100svh] sm:min-h-screen overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentImage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <div className="relative w-full h-full">
            <Image
              src={isMobile ? currentImageData.mobileImageUrl : currentImageData.imageUrl}
              alt={currentImageData.alt}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dots Navigation */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-10">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => goToImage(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentImage
                ? 'bg-primary-500 w-8 sm:w-10'
                : 'bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Ir para slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
