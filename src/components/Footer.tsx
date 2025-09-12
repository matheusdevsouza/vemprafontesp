'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  WhatsappLogo,
  Envelope,
  Phone,
  MapPin,
  CreditCard,
  Shield,
  Truck,
  ArrowUp,
  ArrowRight
} from 'phosphor-react'
import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInstagram, faTiktok, faWhatsapp } from '@fortawesome/free-brands-svg-icons'
import { useCart } from '@/contexts/CartContext'

export function Footer() {
  const [email, setEmail] = useState('')
  const { isCartSidebarOpen } = useCart()

  // Estilos personalizados para a scrollbar
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      /* Webkit browsers (Chrome, Safari, Edge) */
      ::-webkit-scrollbar {
        width: 12px;
        height: 12px;
      }
      
      ::-webkit-scrollbar-track {
        background: #1f2937;
        border-radius: 6px;
      }
      
      ::-webkit-scrollbar-thumb {
        background: #ef4444;
        border-radius: 6px;
        border: 2px solid #1f2937;
      }
      
      ::-webkit-scrollbar-thumb:hover {
        background: #dc2626;
      }
      
      /* Firefox */
      * {
        scrollbar-width: thin;
        scrollbar-color: #ef4444 #1f2937;
      }
    `
    document.head.appendChild(style)
    
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const footerLinks = [
    {
      title: 'Informações',
      links: [
        { label: 'Sobre Nós', href: '/sobre' },
        { label: 'Como Funciona', href: '/como-comprar' },
        { label: 'Garantia', href: '/trocas-e-devolucoes' },
        { label: 'Política de Frete', href: '/entregas' },
      ]
    },
    {
      title: 'Ajuda',
      links: [
        { label: 'FAQ', href: '/faq' },
        { label: 'Como Comprar', href: '/como-comprar' },
        { label: 'Trocas e Devoluções', href: '/trocas-e-devolucoes' },
        { label: 'Entregas', href: '/entregas' },
      ]
    },
    {
      title: 'Institucional',
      links: [
        { label: 'Política de Privacidade', href: '/politica-de-privacidade' },
        { label: 'Termos de Uso', href: '/termos-de-uso' },
        { label: 'Contato', href: '/contato' },
        { label: 'Brindes', href: '/brinde' },
      ]
    }
  ]

  const paymentMethods = [
    'visa', 'mastercard', 'pix', 'boleto', 'american-express'
  ]



  return (
    <footer className="relative bg-dark-950 border-t border-dark-800">
      {/* Seção principal do footer */}
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Layout Desktop */}
        <div className="hidden lg:grid grid-cols-4 gap-8">
          {/* Logo e Descrição */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="relative w-12 h-12">
                <Image
                  src="/images/Logo.png"
                  alt="VemPraFonteSP"
                  fill
                  sizes="48px"
                  className="object-contain"
                />
              </div>
            </div>
            <p className="text-base text-gray-400 mb-8">
              Seu e-commerce especializado em tênis.
            </p>

            {/* Redes Sociais */}
            <div className="flex space-x-4">
              <a href="https://www.instagram.com/vemprafontesp?igsh=dXJxbGE0dTE3em96" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-dark-800 hover:bg-primary-500 rounded-lg flex items-center justify-center text-white transition-all duration-300" aria-label="Instagram">
                <FontAwesomeIcon icon={faInstagram} size="sm" />
              </a>
              <a href="https://www.tiktok.com/@vemprafontesp?_t=ZM-8zGiCuCuxU8&_r=1" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-dark-800 hover:bg-primary-500 rounded-lg flex items-center justify-center text-white transition-all duration-300" aria-label="TikTok">
                <FontAwesomeIcon icon={faTiktok} size="sm" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="col-span-2 grid grid-cols-3 gap-8">
            {footerLinks.map((section) => (
              <div key={section.title}>
                <h3 className="text-base font-semibold text-white mb-4">
                  {section.title}
                </h3>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        className="text-sm text-gray-400 hover:text-primary-400 transition-colors duration-300"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-base font-semibold text-white mb-4">
              Newsletter
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              Fique por dentro das novidades e ofertas exclusivas!
            </p>
            <div className="flex w-full">
              <input
                type="email"
                placeholder="Seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-dark-800 border border-dark-700 rounded-l-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-all duration-300 text-base"
              />
              <button className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-r-lg font-medium transition-all duration-300 text-base">
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Layout Mobile */}
        <div className="lg:hidden space-y-8">
          {/* Logo e Redes Sociais */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="relative w-12 h-12">
                <Image
                  src="/images/Logo.png"
                  alt="VemPraFonteSP"
                  fill
                  sizes="48px"
                  className="object-contain"
                />
              </div>
            </div>
            <p className="text-base text-gray-400 mb-6">
              Seu e-commerce especializado em tênis.
            </p>

            {/* Redes Sociais */}
            <div className="flex justify-center space-x-4">
              <a href="https://www.instagram.com/vemprafontesp?igsh=dXJxbGE0dTE3em96" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-dark-800 hover:bg-primary-500 rounded-lg flex items-center justify-center text-white transition-all duration-300" aria-label="Instagram">
                <FontAwesomeIcon icon={faInstagram} size="lg" />
              </a>
              <a href="https://www.tiktok.com/@vemprafontesp?_t=ZM-8zGiCuCuxU8&_r=1" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-dark-800 hover:bg-primary-500 rounded-lg flex items-center justify-center text-white transition-all duration-300" aria-label="TikTok">
                <FontAwesomeIcon icon={faTiktok} size="lg" />
              </a>
            </div>
          </div>

          {/* Newsletter Mobile */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white mb-3">
              Newsletter
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Fique por dentro das novidades e ofertas exclusivas!
            </p>
            <div className="flex w-full max-w-sm mx-auto">
              <input
                type="email"
                placeholder="Seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-dark-800 border border-dark-700 rounded-l-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-all duration-300 text-base"
              />
              <button className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-r-lg font-medium transition-all duration-300 text-base">
                <ArrowRight size={20} />
              </button>
            </div>
          </div>

          {/* Links Mobile - Accordion Style */}
          <div className="space-y-4">
            {footerLinks.map((section, index) => (
              <div key={section.title} className="border-b border-dark-800 pb-4">
                <h3 className="text-base font-semibold text-white mb-3">
                  {section.title}
                </h3>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        className="text-sm text-gray-400 hover:text-primary-400 transition-colors duration-300 block py-1"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Linha divisória */}
        <div className="border-t border-dark-800 my-8 sm:my-12"></div>

        {/* Seção inferior */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center">
          {/* Informações da empresa */}
          <div className="text-center md:text-left">
            <p className="text-sm text-gray-400 mb-2">
              429.970.598-01
            </p>
            <p className="text-sm text-gray-400">
              © 2025 VemPraFonteSP. Todos os direitos reservados.
            </p>
          </div>

          {/* Métodos de pagamento */}
          <div className="flex flex-wrap justify-center md:justify-end gap-4">
            {paymentMethods.map((method) => (
              <motion.div
                key={method}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="group relative"
                title={method.toUpperCase()}
              >
                <div className="w-14 h-10 rounded-xl flex items-center justify-center bg-dark-800 hover:bg-dark-700 transition-all duration-300 cursor-pointer">
                  <span className="text-sm text-white font-bold tracking-wide">
                    {method === 'visa' && 'VISA'}
                    {method === 'mastercard' && 'MC'}
                    {method === 'pix' && 'PIX'}
                    {method === 'boleto' && 'BOL'}
                    {method === 'american-express' && 'AMEX'}
                  </span>
                </div>
                
                {/* Efeito de brilho no hover */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                
                {/* Borda sutil */}
                <div className="absolute inset-0 rounded-xl border border-white/10 group-hover:border-white/20 transition-colors duration-300" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Botões flutuantes */}
      <div className="fixed bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 flex justify-between z-40">
        {/* Botão de voltar ao topo */}
        <motion.button
          onClick={scrollToTop}
          className="w-12 h-12 sm:w-14 sm:h-14 bg-primary-500 hover:bg-primary-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <ArrowUp size={20} className="sm:w-6 sm:h-6" weight="bold" />
        </motion.button>

        {/* Botão de WhatsApp */}
        <motion.a
          href="https://wa.me/5511939025934?text=Olá! Gostaria de saber mais sobre os produtos da VemPraFonteSP."
          target="_blank"
          rel="noopener noreferrer"
          className="relative w-12 h-12 sm:w-14 sm:h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center overflow-hidden group"
          whileHover={{ 
            scale: 1.1,
            rotate: 15,
            transition: { duration: 0.2 }
          }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          {/* Efeito de iluminação interna */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 transform -skew-x-12"
            whileHover={{
              x: [0, 200, 0],
              transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
            }}
          />
          
          {/* Ícone do WhatsApp */}
          <svg className="relative z-10 w-6 h-6 sm:w-7 sm:h-7" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
          </svg>
        </motion.a>
      </div>
    </footer>

  )
} 