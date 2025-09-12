'use client'

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaQuestionCircle } from 'react-icons/fa';

const FAQSkeleton = () => (
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
      
      {/* Skeletons dos itens FAQ */}
      <div className="space-y-4">
        {[...Array(15)].map((_, i) => (
          <div key={i} className="overflow-hidden rounded-xl bg-dark-900/80 border border-dark-700">
            <div className="w-full flex items-center justify-between px-5 py-4">
              <div className="h-5 bg-gray-700 rounded w-3/4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-shimmer"></div>
              </div>
              <div className="w-5 h-5 bg-gray-700 rounded relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-shimmer"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Skeleton do call-to-action */}
      <div className="text-center mt-12">
        <div className="bg-dark-800/50 border border-dark-700 rounded-2xl p-8">
          <div className="w-12 h-12 bg-gray-700 rounded-full mx-auto mb-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-shimmer"></div>
          </div>
          <div className="h-6 bg-gray-700 rounded w-48 mx-auto mb-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-shimmer"></div>
          </div>
          <div className="space-y-2 mb-6">
            <div className="h-4 bg-gray-700 rounded w-full relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-shimmer"></div>
            </div>
            <div className="h-4 bg-gray-700 rounded w-3/4 mx-auto relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-shimmer"></div>
            </div>
          </div>
          <div className="h-12 bg-gray-700 rounded-lg w-32 mx-auto relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-shimmer"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function FAQ() {
  const [loading, setLoading] = useState(true);
  const [openItems, setOpenItems] = useState<number[]>([]);

  const faqs = [
    { pergunta: 'Quais são os horários de atendimento?', resposta: 'Nosso atendimento é de segunda a sexta, das 9h às 18h, exceto feriados.' },
    { pergunta: 'Como acompanho meu pedido?', resposta: 'Você pode acompanhar seu pedido acessando sua conta ou pelo link de rastreamento enviado por e-mail.' },
    { pergunta: 'Quais formas de contato posso usar?', resposta: 'Você pode falar conosco por WhatsApp, e-mail ou telefone. Todos os canais estão disponíveis na página de contato.' },
    { pergunta: 'Posso retirar o produto na loja física?', resposta: 'Atualmente trabalhamos apenas com vendas online e entregas em todo o Brasil.' },
    { pergunta: 'Como faço para trocar ou devolver um produto?', resposta: 'Acesse a seção de Trocas e Devoluções ou entre em contato pelo formulário de contato.' },
    { pergunta: 'Vocês vendem para atacado?', resposta: 'Sim! Entre em contato pelo WhatsApp para condições especiais para lojistas.' },
    { pergunta: 'Quais formas de pagamento são aceitas?', resposta: 'Aceitamos cartões de crédito, débito, Pix e boleto bancário.' },
    { pergunta: 'Como funciona o frete?', resposta: 'O valor e prazo do frete são calculados automaticamente no checkout, de acordo com seu CEP. Oferecemos frete grátis para compras acima de R$ 199.' },
    { pergunta: 'Posso alterar meu endereço após a compra?', resposta: 'Entre em contato o quanto antes para tentarmos alterar antes do envio.' },
    { pergunta: 'Recebi um produto com defeito, o que faço?', resposta: 'Entre em contato imediatamente para solucionarmos o problema o mais rápido possível.' },
    { pergunta: 'Qual o prazo para troca de produtos?', resposta: 'Oferecemos troca gratuita em até 30 dias após o recebimento do produto, desde que esteja em perfeitas condições de uso.' },
    { pergunta: 'Como funciona o rastreamento da entrega?', resposta: 'Você receberá um código de rastreamento por e-mail assim que o pedido for enviado. Acompanhe em tempo real pelo site.' },
    { pergunta: 'Os produtos têm garantia?', resposta: 'Sim, todos os nossos produtos possuem garantia de 30 dias.' },
    { pergunta: 'Posso parcelar no cartão?', resposta: 'Sim! Oferecemos parcelamento em até 12x sem juros no cartão de crédito.' },
  ];

  useEffect(() => {
    // Simular carregamento
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  if (loading) {
    return <FAQSkeleton />;
  }

  return (
    <div className="min-h-screen bg-dark-950 text-white py-12 px-4 md:px-0">
      <div className="max-w-4xl mx-auto flex flex-col gap-8 text-left">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-0">Perguntas Frequentes</h1>
          <p className="text-gray-400 text-lg mb-10">Encontre respostas para as principais dúvidas sobre nossos produtos e serviços</p>
        </motion.div>
        
        <motion.section 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6, delay: 0.1 }} 
          className="space-y-4 text-left"
        >
          {faqs.map((faq, i) => {
            const isOpen = openItems.includes(i);
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + (i * 0.05), duration: 0.4 }}
                className={`overflow-hidden rounded-xl transition-all duration-300 ${isOpen ? 'border-l-4 border-primary-500 bg-dark-800/70' : 'border-l-4 border-transparent bg-dark-900/80'} border`}
              >
                <button
                  type="button"
                  className={`w-full flex items-center justify-between px-5 py-4 cursor-pointer text-base font-semibold select-none transition-all duration-300 ${isOpen ? 'text-primary-500' : 'text-white'} focus:outline-none text-left`}
                  onClick={() => toggleItem(i)}
                  aria-expanded={isOpen}
                >
                  <span className="text-left flex-1">{faq.pergunta}</span>
                  <motion.span 
                    className={`ml-4 flex-shrink-0 transition-all duration-300 ${isOpen ? 'text-primary-500' : 'text-primary-500'}`}
                    animate={{ rotate: isOpen ? 90 : 0 }}
                  >
                    <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.293 7.293a1 1 0 011.414 0L10 9.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </motion.span>
                </button>
                <motion.div
                  initial={false}
                  animate={{ 
                    height: isOpen ? 'auto' : 0,
                    opacity: isOpen ? 1 : 0
                  }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-4 pt-1">
                    <p className="text-gray-400 text-sm leading-relaxed">{faq.resposta}</p>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.section>

        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="bg-dark-800/50 border border-dark-700 rounded-2xl p-8">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
            >
              <FaQuestionCircle className="text-primary-500 mx-auto mb-4" size={48} />
            </motion.div>
            <h2 className="text-xl font-semibold text-white mb-4">Ainda tem dúvidas?</h2>
            <p className="text-gray-300 mb-6">
              Se não encontrou a resposta que procurava, entre em contato conosco. 
              Nossa equipe está pronta para ajudar!
            </p>
            <motion.a 
              href="/contato" 
              className="inline-block bg-primary-500 hover:bg-primary-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Fale Conosco
            </motion.a>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 
