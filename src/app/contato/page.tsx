'use client'

import { FaInstagram, FaFacebookF, FaTwitter, FaYoutube, FaWhatsapp, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaClock } from 'react-icons/fa'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface FAQItemProps {
  faq: { pergunta: string; resposta: string };
  index: number;
}

const FAQItem = ({ faq, index }: FAQItemProps) => {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + (index * 0.05), duration: 0.4 }}
      className={`overflow-hidden rounded-xl transition-all duration-300 ${open ? 'border-l-4 border-primary-500 bg-dark-800/70' : 'border-l-4 border-transparent bg-dark-900/80'} border`}
    >
      <button
        type="button"
        className={`w-full flex items-center justify-between px-5 py-4 cursor-pointer text-base font-semibold select-none transition-all duration-300 ${open ? 'text-primary-500' : 'text-white'} focus:outline-none`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span>{faq.pergunta}</span>
        <motion.span 
          className={`ml-4 transition-all duration-300 ${open ? 'text-primary-500' : 'text-primary-500'}`}
          animate={{ rotate: open ? 90 : 0 }}
        >
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.293 7.293a1 1 0 011.414 0L10 9.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
        </motion.span>
      </button>
      <motion.div
        initial={false}
        animate={{ 
          height: open ? 'auto' : 0,
          opacity: open ? 1 : 0
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
};

const ContatoSkeleton = () => (
  <div className="min-h-screen bg-dark-950 text-white py-12 px-4 md:px-0">
    <div className="max-w-5xl mx-auto flex flex-col gap-10">
      {/* Skeleton do título */}
      <div className="mb-2">
        <div className="h-12 bg-gray-800 rounded-lg mx-auto max-w-md mb-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-shimmer"></div>
        </div>
        <div className="h-6 bg-gray-800 rounded-md mx-auto max-w-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-shimmer"></div>
        </div>
      </div>

      {/* Skeletons dos cards de contato */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex flex-col items-center bg-dark-900 rounded-xl p-6 shadow-sm min-w-[240px]">
            <div className="w-7 h-7 bg-gray-700 rounded-full mb-2 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-shimmer"></div>
            </div>
            <div className="h-6 bg-gray-700 rounded w-24 mb-1 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-shimmer"></div>
            </div>
            <div className="h-4 bg-gray-700 rounded w-32 mb-1 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-shimmer"></div>
            </div>
            <div className="h-5 bg-gray-700 rounded w-28 mt-1 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-shimmer"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Skeleton FAQ */}
      <div className="max-w-3xl mx-auto">
        <div className="h-6 bg-gray-700 rounded w-48 mb-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-shimmer"></div>
        </div>
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
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
      </div>
    </div>

    {/* Skeleton do mapa */}
    <div className="max-w-5xl mx-auto mt-12">
      <div className="h-8 bg-gray-700 rounded w-48 mx-auto mb-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-shimmer"></div>
      </div>
      <div className="w-full h-72 md:h-96 bg-gray-700 rounded-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-shimmer"></div>
      </div>
    </div>
  </div>
);

export default function Contato() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simular carregamento
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const faqs = [
    { pergunta: 'Quais são os horários de atendimento?', resposta: 'Nosso atendimento é de segunda a sexta, das 9h às 18h, exceto feriados.' },
    { pergunta: 'Como acompanho meu pedido?', resposta: 'Você pode acompanhar seu pedido acessando sua conta ou pelo link de rastreamento enviado por e-mail.' },
    { pergunta: 'Quais formas de contato posso usar?', resposta: 'Você pode falar conosco por WhatsApp, e-mail ou telefone. Todos os canais estão disponíveis nesta página.' },
    { pergunta: 'Posso retirar o produto na loja física?', resposta: 'Atualmente trabalhamos apenas com vendas online e entregas em todo o Brasil.' },
    { pergunta: 'Como faço para trocar ou devolver um produto?', resposta: 'Acesse a seção de Trocas e Devoluções ou entre em contato pelo formulário abaixo.' },
    { pergunta: 'Vocês vendem para atacado?', resposta: 'Sim! Entre em contato pelo WhatsApp para condições especiais para lojistas.' },
    { pergunta: 'Quais formas de pagamento são aceitas?', resposta: 'Aceitamos cartões de crédito, débito, Pix e boleto bancário.' },
    { pergunta: 'Como funciona o frete?', resposta: 'O valor e prazo do frete são calculados automaticamente no checkout, de acordo com seu CEP.' },
    { pergunta: 'Posso alterar meu endereço após a compra?', resposta: 'Entre em contato o quanto antes para tentarmos alterar antes do envio.' },
    { pergunta: 'Recebi um produto com defeito, o que faço?', resposta: 'Entre em contato imediatamente para solucionarmos o problema o mais rápido possível.' },
  ]

  if (loading) {
    return <ContatoSkeleton />;
  }

  return (
    <div className="min-h-screen bg-dark-950 text-white py-12 px-4 md:px-0">
      <div className="max-w-5xl mx-auto flex flex-col gap-10">
        {/* Título pequeno */}
        <motion.div 
          className="mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 text-center">Central de Atendimento</h1>
          <p className="text-gray-400 text-lg mb-8 text-center">Tem alguma dúvida? Entre em contato, estamos aqui para te ajudar!</p>
        </motion.div>

        {/* Cards de contato */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }} 
            className="flex flex-col items-center bg-dark-900 rounded-xl p-6 shadow-sm min-w-[240px]"
          >
            <FaWhatsapp className="text-primary-500 mb-2" size={28} />
            <span className="font-semibold text-lg text-white mb-1">WhatsApp</span>
            <span className="text-gray-400 text-sm">Atendimento rápido</span>
            <a href="https://wa.me/5511939025934" target="_blank" rel="noopener noreferrer" className="text-gray-300 text-base mt-1 hover:text-primary-500 underline-offset-4 transition-colors">(11) 93902-5934</a>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.1 }} 
            className="flex flex-col items-center bg-dark-900 rounded-xl p-6 shadow-sm min-w-[240px]"
          >
            <FaEnvelope className="text-primary-500 mb-2" size={28} />
            <span className="font-semibold text-lg text-white mb-1">E-mail</span>
            <span className="text-gray-400 text-sm">Resposta em até 7 dias</span>
            <a href="mailto:contato@vemprafontesp.com.br" className="text-gray-300 text-base mt-1 hover:text-primary-500 underline-offset-4 transition-colors">contato@vemprafontesp.com.br</a>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.2 }} 
            className="flex flex-col items-center bg-dark-900 rounded-xl p-6 shadow-sm min-w-[240px]"
          >
            <FaPhoneAlt className="text-primary-500 mb-2" size={28} />
            <span className="font-semibold text-lg text-white mb-1">Telefone</span>
            <span className="text-gray-400 text-sm">Seg-Sex: 9h às 18h</span>
            <a href="tel:5511939025934" className="text-gray-300 text-base mt-1 hover:text-primary-500 underline-offset-4 transition-colors">(11) 93902-5934</a>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.3 }} 
            className="flex flex-col items-center bg-dark-900 rounded-xl p-6 shadow-sm min-w-[240px]"
          >
            <FaClock className="text-primary-500 mb-2" size={28} />
            <span className="font-semibold text-lg text-white mb-1">Horário</span>
            <span className="text-gray-400 text-sm">Segunda a Sexta</span>
            <span className="text-gray-300 text-base mt-1">9h às 18h</span>
          </motion.div>
        </div>

        {/* FAQ Centralizado */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6, delay: 0.1 }} 
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-xl font-semibold mb-4 text-white text-center">Perguntas Frequentes</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <FAQItem key={i} faq={faq} index={i} />
            ))}
          </div>
        </motion.section>
      </div>
      
      {/* Mapa da loja */}
      <motion.div 
        className="max-w-5xl mx-auto mt-12"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <h2 className="text-2xl font-semibold mb-4 text-white text-center">Nossa Localização</h2>
        <div className="w-full h-72 md:h-96 rounded-2xl overflow-hidden shadow-lg">
          <iframe
            title="Mapa da loja"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3656.879234234234!2d-46.7244016!3d-23.3279532!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94cee6a7cb6f61eb%3A0xa321d69e795bf8a6!2sFranco%20da%20Rocha%2C%20SP!5e0!3m2!1spt-BR!2sbr!4v1680000000000!5m2!1spt-BR!2sbr&style=element:labels%7Cvisibility:off"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-72 md:h-96 rounded-2xl"
          ></iframe>
        </div>
      </motion.div>
    </div>
  )
} 
