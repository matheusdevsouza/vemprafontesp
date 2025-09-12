'use client'

import React, { useState, useEffect } from 'react';
import { FaSearch, FaShoppingCart, FaRegAddressCard, FaCreditCard, FaSmile } from 'react-icons/fa';
import Link from 'next/link';
import { motion } from 'framer-motion';

const ComoComprarSkeleton = () => (
  <div className="min-h-screen bg-dark-950 text-white py-12 px-4 md:px-0">
    <div className="max-w-6xl mx-auto flex flex-col gap-12">
      {/* Skeleton do título */}
      <div className="text-center">
        <div className="h-12 bg-gray-800 rounded-lg mx-auto max-w-md mb-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-shimmer"></div>
        </div>
        <div className="h-6 bg-gray-800 rounded-md mx-auto max-w-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-shimmer"></div>
        </div>
      </div>
      
      {/* Skeletons dos cards */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-4 justify-center items-stretch w-full">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="group bg-dark-800/70 border border-dark-700/50 rounded-2xl flex-1 flex flex-col items-center p-6 shadow-lg">
            <div className="w-12 h-12 bg-gray-700 rounded-full mb-3 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-shimmer"></div>
            </div>
            <div className="h-6 bg-gray-700 rounded w-3/4 mb-2 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-shimmer"></div>
            </div>
            <div className="space-y-2 w-full">
              <div className="h-4 bg-gray-700 rounded w-full relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-shimmer"></div>
              </div>
              <div className="h-4 bg-gray-700 rounded w-5/6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-shimmer"></div>
              </div>
              <div className="h-4 bg-gray-700 rounded w-4/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-shimmer"></div>
              </div>
            </div>
            <div className="mt-auto pt-4 w-8 h-8 bg-gray-700 rounded relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-shimmer"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Skeleton do botão */}
      <div className="flex flex-col items-center gap-6 mt-10">
        <div className="h-14 bg-gray-700 rounded-2xl w-64 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-shimmer"></div>
        </div>
      </div>
    </div>
  </div>
);

const steps = [
  {
    icon: <FaSearch size={36} className="text-primary-500" />, title: 'Encontre seu produto',
    desc: 'Explore as categorias, use filtros e descubra o modelo perfeito para você.'
  },
  {
    icon: <FaShoppingCart size={36} className="text-primary-500" />, title: 'Adicione ao carrinho',
    desc: 'Escolha tamanho, cor e clique em Adicionar ao carrinho. Continue comprando ou vá para o carrinho.'
  },
  {
    icon: <FaRegAddressCard size={36} className="text-primary-500" />, title: 'Informe seus dados',
    desc: 'No checkout, preencha seus dados de entrega e escolha a forma de envio.'
  },
  {
    icon: <FaCreditCard size={36} className="text-primary-500" />, title: 'Pague com segurança',
    desc: 'Selecione o método de pagamento: cartão, Pix ou boleto. Processo 100% seguro.'
  },
  {
    icon: <FaSmile size={36} className="text-primary-500" />, title: 'Aguarde e aproveite',
    desc: 'Você receberá um e-mail com os detalhes e poderá acompanhar a entrega pelo site.'
  },
];

export default function ComoComprar() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <ComoComprarSkeleton />;
  }

  return (
    <div className="min-h-screen bg-dark-950 text-white py-12 px-4 md:px-0">
      <div className="max-w-6xl mx-auto flex flex-col gap-12">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-0">Como Comprar</h1>
          <p className="text-gray-400 text-lg mb-10">Veja como realizar suas compras em nossa loja:</p>
        </motion.div>
        
        <div className="flex flex-col md:flex-row gap-6 md:gap-4 justify-center items-stretch w-full">
          {steps.map((step, i) => (
            <motion.div 
              key={i} 
              className="group bg-dark-800/70 border border-dark-700/50 rounded-2xl flex-1 flex flex-col items-center p-6 shadow-lg hover:shadow-primary-500/10 transition-all duration-500 cursor-pointer hover:border-primary-500/40 hover:bg-dark-800/90"
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.6, 
                delay: 0.1 + (i * 0.1),
                type: "spring",
                stiffness: 100
              }}
              whileHover={{ 
                y: -5,
                transition: { duration: 0.2 }
              }}
            >
              <motion.div 
                className="mb-3"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  duration: 0.5, 
                  delay: 0.2 + (i * 0.1),
                  type: "spring",
                  stiffness: 200
                }}
              >
                {step.icon}
              </motion.div>
              <h2 className="text-lg font-bold text-white mb-2 group-hover:text-primary-400 transition-colors duration-300 text-center">{step.title}</h2>
              <p className="text-gray-300 text-sm text-center">{step.desc}</p>
              <motion.div 
                className="mt-auto pt-4 text-primary-500 font-bold text-xl"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  duration: 0.4, 
                  delay: 0.3 + (i * 0.1),
                  type: "spring",
                  stiffness: 300
                }}
              >
                {i + 1}
              </motion.div>
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          className="flex flex-col items-center gap-6 mt-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/produtos" className="bg-primary-500 hover:bg-primary-600 text-white font-bold px-8 py-4 rounded-2xl text-lg shadow-lg transition-all duration-300">
              Conheça nossos produtos
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
} 