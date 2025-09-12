'use client'

import React, { useState, useEffect } from 'react';
import { FaExchangeAlt, FaUndo, FaShieldAlt, FaClock, FaTruck, FaCheckCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';

const TrocasSkeleton = () => (
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
        {[...Array(4)].map((_, i) => (
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
              <div className="space-y-2 mt-4">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-4 bg-gray-700 rounded w-full relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-shimmer"></div>
                  </div>
                ))}
              </div>
            )}
            
            {i === 1 && (
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
            
            {i === 2 && (
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
            
            {i === 3 && (
              <div className="space-y-4 mt-4">
                {[...Array(3)].map((_, j) => (
                  <div key={j}>
                    <div className="h-5 bg-gray-600 rounded w-3/4 mb-2 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 animate-shimmer"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-600 rounded w-full relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 animate-shimmer"></div>
                      </div>
                      <div className="h-4 bg-gray-600 rounded w-5/6 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 animate-shimmer"></div>
                      </div>
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

export default function TrocasEDevolucoes() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <TrocasSkeleton />;
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
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-0">Trocas e Devoluções</h1>
          <p className="text-gray-400 text-lg mb-10">Conheça nossa política de trocas e devoluções</p>
        </motion.div>
        
        <section className="space-y-8">
          <motion.div 
            className="bg-dark-800/50 border border-dark-700 rounded-2xl p-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <FaShieldAlt className="text-primary-500" size={24} />
              <h2 className="text-xl font-semibold text-white">Política de Trocas</h2>
            </div>
            <p className="text-gray-300 mb-4">
              Oferecemos troca gratuita em até 30 dias após o recebimento do produto, desde que esteja em perfeitas condições de uso.
            </p>
            <motion.ul 
              className="text-gray-300 space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <li>• O produto deve estar sem uso e na embalagem original</li>
              <li>• Todos os acessórios e etiquetas devem estar intactos</li>
              <li>• Não aceitamos produtos com sinais de uso ou danos</li>
            </motion.ul>
          </motion.div>

          <motion.div 
            className="bg-dark-800/50 border border-dark-700 rounded-2xl p-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <FaUndo className="text-primary-500" size={24} />
              <h2 className="text-xl font-semibold text-white">Como Solicitar uma Troca</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <h3 className="text-lg font-semibold text-primary-400 mb-2">1. Entre em Contato</h3>
                <p className="text-gray-300 text-sm">Entre em contato conosco pelo WhatsApp, e-mail ou telefone informando o motivo da troca.</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <h3 className="text-lg font-semibold text-primary-400 mb-2">2. Envie o Produto</h3>
                <p className="text-gray-300 text-sm">Após a aprovação, envie o produto para nosso endereço com a etiqueta de retorno.</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <h3 className="text-lg font-semibold text-primary-400 mb-2">3. Receba o Novo</h3>
                <p className="text-gray-300 text-sm">Após recebermos e analisarmos o produto, enviaremos o novo item ou reembolso.</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <h3 className="text-lg font-semibold text-primary-400 mb-2">4. Acompanhe</h3>
                <p className="text-gray-300 text-sm">Acompanhe o status da sua troca pelo site ou entre em contato conosco.</p>
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
              <FaClock className="text-primary-500" size={24} />
              <h2 className="text-xl font-semibold text-white">Prazos e Condições</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div className="bg-primary-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <FaClock className="text-primary-500" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">30 Dias</h3>
                <p className="text-gray-300 text-sm">Prazo para solicitar troca após recebimento</p>
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
                <h3 className="text-lg font-semibold text-white mb-2">5-7 Dias</h3>
                <p className="text-gray-300 text-sm">Prazo para análise e envio do novo produto</p>
              </motion.div>
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <div className="bg-primary-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <FaCheckCircle className="text-primary-500" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">100% Seguro</h3>
                <p className="text-gray-300 text-sm">Processo totalmente seguro e rastreado</p>
              </motion.div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-dark-800/50 border border-dark-700 rounded-2xl p-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <FaExchangeAlt className="text-primary-500" size={24} />
              <h2 className="text-xl font-semibold text-white">Casos Especiais</h2>
            </div>
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <h3 className="text-lg font-semibold text-primary-400 mb-2">Produto com Defeito</h3>
                <p className="text-gray-300">Em caso de defeito de fabricação, oferecemos troca imediata ou reembolso integral, independente do prazo de 30 dias.</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <h3 className="text-lg font-semibold text-primary-400 mb-2">Erro no Pedido</h3>
                <p className="text-gray-300">Se você recebeu um produto diferente do solicitado, entre em contato imediatamente para correção sem custos adicionais.</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <h3 className="text-lg font-semibold text-primary-400 mb-2">Reembolso</h3>
                <p className="text-gray-300">O reembolso será processado no mesmo método de pagamento utilizado na compra, em até 7 dias úteis após a aprovação.</p>
              </motion.div>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
} 