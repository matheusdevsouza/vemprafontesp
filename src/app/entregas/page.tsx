'use client'

import React, { useState, useEffect } from 'react';
import { FaTruck, FaMapMarkerAlt, FaClock, FaShieldAlt, FaBox, FaSearch, FaGift, FaGlobe } from 'react-icons/fa';
import { motion } from 'framer-motion';

const EntregasSkeleton = () => (
  <div className="min-h-screen bg-dark-950 text-white py-12 px-4 md:px-0">
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
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
      <div className="space-y-8">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-dark-800/50 border border-dark-700 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 bg-gray-700 rounded relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-shimmer"></div>
              </div>
              <div className="h-6 bg-gray-700 rounded w-48 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-shimmer"></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-700 rounded w-full relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-shimmer"></div>
              </div>
              <div className="h-4 bg-gray-700 rounded w-3/4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-shimmer"></div>
              </div>
              <div className="h-4 bg-gray-700 rounded w-5/6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-shimmer"></div>
              </div>
            </div>
            
            {/* Skeletons específicos para cada tipo de card */}
            {i === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {[...Array(2)].map((_, j) => (
                  <div key={j} className="bg-dark-700/50 rounded-lg p-4">
                    <div className="h-5 bg-gray-600 rounded w-3/4 mb-2 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 animate-shimmer"></div>
                    </div>
                    <div className="h-4 bg-gray-600 rounded w-full relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 animate-shimmer"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {i === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="text-center">
                    <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-3 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-shimmer"></div>
                    </div>
                    <div className="h-5 bg-gray-700 rounded w-full mb-2 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-shimmer"></div>
                    </div>
                    <div className="h-4 bg-gray-700 rounded w-2/3 mx-auto relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-shimmer"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {i === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                {[...Array(2)].map((_, j) => (
                  <div key={j}>
                    <div className="h-5 bg-gray-600 rounded w-3/4 mb-2 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 animate-shimmer"></div>
                    </div>
                    <div className="h-4 bg-gray-600 rounded w-full relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 animate-shimmer"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {i === 3 && (
              <div className="space-y-2 mt-4">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="h-4 bg-gray-700 rounded w-full relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-shimmer"></div>
                  </div>
                ))}
              </div>
            )}
            
            {i === 4 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                {[...Array(4)].map((_, j) => (
                  <div key={j}>
                    <div className="h-5 bg-gray-600 rounded w-3/4 mb-2 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 animate-shimmer"></div>
                    </div>
                    <div className="h-4 bg-gray-600 rounded w-full relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 animate-shimmer"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default function Entregas() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <EntregasSkeleton />;
  }

  return (
    <div className="min-h-screen bg-dark-950 text-white py-12 px-4 md:px-0">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-0">Entregas</h1>
          <p className="text-gray-400 text-lg mb-10">Conheça nossas opções de entrega e prazos</p>
        </motion.div>
        
        <section className="space-y-8">
          <motion.div 
            className="bg-dark-800/50 border border-dark-700 rounded-2xl p-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <FaGift className="text-primary-500" size={24} />
              <h2 className="text-xl font-semibold text-white">Frete Grátis</h2>
            </div>
            <p className="text-gray-300 mb-4">
              Oferecemos frete grátis para compras acima de R$ 199 em todo o Brasil.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-dark-700/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-primary-400 mb-2">Compras acima de R$ 199</h3>
                <p className="text-gray-300 text-sm">Frete grátis para todo o Brasil</p>
              </div>
              <div className="bg-dark-700/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-primary-400 mb-2">Compras abaixo de R$ 199</h3>
                <p className="text-gray-300 text-sm">Frete calculado automaticamente</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-dark-800/50 border border-dark-700 rounded-2xl p-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <FaClock className="text-primary-500" size={24} />
              <h2 className="text-xl font-semibold text-white">Prazos de Entrega</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="bg-primary-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <FaMapMarkerAlt className="text-primary-500" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Capital e Região Metropolitana</h3>
                <p className="text-gray-300 text-sm">1-2 dias úteis</p>
              </motion.div>
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div className="bg-primary-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <FaGlobe className="text-primary-500" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Interior do Estado</h3>
                <p className="text-gray-300 text-sm">2-3 dias úteis</p>
              </motion.div>
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <div className="bg-primary-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <FaTruck className="text-primary-500" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Outros Estados</h3>
                <p className="text-gray-300 text-sm">3-7 dias úteis</p>
              </motion.div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-dark-800/50 border border-dark-700 rounded-2xl p-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <FaSearch className="text-primary-500" size={24} />
              <h2 className="text-xl font-semibold text-white">Rastreamento</h2>
            </div>
            <p className="text-gray-300 mb-4">
              Acompanhe sua entrega em tempo real através do código de rastreamento enviado por e-mail.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-primary-400 mb-2">Código de Rastreamento</h3>
                <p className="text-gray-300 text-sm">Você receberá o código por e-mail assim que o pedido for enviado.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-primary-400 mb-2">Acompanhamento Online</h3>
                <p className="text-gray-300 text-sm">Acesse sua conta para acompanhar o status do pedido.</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-dark-800/50 border border-dark-700 rounded-2xl p-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <FaBox className="text-primary-500" size={24} />
              <h2 className="text-xl font-semibold text-white">Embalagem e Proteção</h2>
            </div>
            <p className="text-gray-300 mb-4">
              Todos os produtos são embalados com cuidado para garantir que cheguem em perfeitas condições.
            </p>
            <motion.ul 
              className="text-gray-300 space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <li>• Embalagem resistente e segura</li>
              <li>• Proteção contra impactos e umidade</li>
              <li>• Caixa personalizada da VemPraFonte</li>
              <li>• Produto lacrado e autenticado</li>
            </motion.ul>
          </motion.div>

          <motion.div 
            className="bg-dark-800/50 border border-dark-700 rounded-2xl p-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <FaShieldAlt className="text-primary-500" size={24} />
              <h2 className="text-xl font-semibold text-white">Segurança na Entrega</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <h3 className="text-lg font-semibold text-primary-400 mb-2">Assinatura Obrigatória</h3>
                <p className="text-gray-300 text-sm">Todas as entregas requerem assinatura do destinatário para maior segurança.</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <h3 className="text-lg font-semibold text-primary-400 mb-2">Seguro de Transporte</h3>
                <p className="text-gray-300 text-sm">Todos os produtos são segurados durante o transporte.</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <h3 className="text-lg font-semibold text-primary-400 mb-2">Verificação na Entrega</h3>
                <p className="text-gray-300 text-sm">Sempre verifique a embalagem antes de assinar o recebimento.</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.9 }}
              >
                <h3 className="text-lg font-semibold text-primary-400 mb-2">Suporte 24/7</h3>
                <p className="text-gray-300 text-sm">Em caso de problemas, entre em contato conosco imediatamente.</p>
              </motion.div>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
} 