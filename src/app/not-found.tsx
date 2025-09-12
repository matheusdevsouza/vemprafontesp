'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { House, ArrowLeft, Package } from 'phosphor-react'

// Componente de partículas flutuantes
const FloatingParticles = () => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number }>>([])

  useEffect(() => {
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
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
            y: [0, -20, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  )
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-dark-950 relative flex items-center justify-center overflow-hidden">
      {/* Partículas de fundo */}
      <FloatingParticles />
      
      {/* Gradiente de fundo */}
      <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-dark-950 to-black opacity-80" />
      
      {/* Efeito de luz no fundo */}
      <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
      
      {/* Conteúdo principal */}
      <div className="relative z-10 text-center px-4 max-w-2xl">
        {/* Ícone de tênis */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
          className="mb-8 flex justify-center"
        >
          <div className="p-6 bg-primary-500/10 rounded-full border border-primary-500/20">
            <Package size={64} className="text-primary-400" weight="duotone" />
          </div>
        </motion.div>

        {/* Número 404 */}
        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-9xl md:text-[12rem] font-black text-transparent bg-clip-text bg-gradient-to-br from-primary-400 to-primary-600 mb-6 leading-none"
        >
          404
        </motion.h1>

        {/* Título */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-3xl md:text-4xl font-bold text-white mb-4"
        >
          Oops! Pisou em falso
        </motion.h2>

        {/* Descrição */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed"
        >
          Parece que você se perdeu no caminho! A página que você procura não existe ou foi movida. 
          Que tal dar uma olhada nos nossos <span className="text-primary-400 font-semibold">tênis incríveis</span>?
        </motion.p>

        {/* Botões */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          {/* Botão principal - Ir para início */}
          <Link
            href="/"
            className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-primary-500/25"
          >
            <House size={20} weight="duotone" />
            Voltar ao Início
            <motion.div
              className="absolute inset-0 rounded-2xl bg-white/20"
              initial={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          </Link>

          {/* Botão secundário - Voltar */}
          <button
            onClick={() => window.history.back()}
            className="group inline-flex items-center gap-3 bg-dark-800/50 hover:bg-dark-700/70 text-gray-300 hover:text-white font-semibold px-8 py-4 rounded-2xl border border-dark-600 hover:border-primary-500/30 transition-all duration-300 transform hover:scale-105"
          >
            <ArrowLeft size={20} weight="duotone" />
            Página Anterior
          </button>
        </motion.div>

        {/* Links úteis */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="mt-12 pt-8 border-t border-dark-700/50"
        >
          <p className="text-gray-400 mb-4">Ou explore nossas categorias:</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/produtos" className="text-primary-400 hover:text-primary-300 transition-colors duration-200 font-medium">
              Todos os Produtos
            </Link>
            <span className="text-dark-600">•</span>

          </div>
        </motion.div>
      </div>

      {/* Efeito de brilho que se move */}
      <motion.div
        className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-primary-500/50 to-transparent"
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />
    </div>
  )
}






