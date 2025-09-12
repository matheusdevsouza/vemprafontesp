'use client'

import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTshirt, faGift, faCheckCircle, faStar, faArrowRight, faShirt, faBullseye } from '@fortawesome/free-solid-svg-icons'
import { faWhatsapp as faWhatsappBrand } from '@fortawesome/free-brands-svg-icons'
import Link from 'next/link'

export default function BrindePage() {
  const handleWhatsApp = () => {
    const message = encodeURIComponent('Olá! Gostaria de escolher o tamanho da minha camiseta de brinde! 🎁')
    window.open(`https://wa.me/5511939025934?text=${message}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 relative overflow-hidden">
      {/* Partículas flutuantes animadas */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary-500/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: 999,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Gradientes de fundo decorativos */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-primary-500/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-primary-600/10 to-transparent rounded-full blur-3xl" />

      {/* Header da página */}
      <div className="relative pt-32 pb-20">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center"
          >
            {/* Ícone principal com efeito de brilho */}
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full blur-xl opacity-50 animate-pulse" />
                             <div className="relative w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-full flex items-center justify-center shadow-2xl border-0">
                <FontAwesomeIcon 
                  icon={faGift} 
                  className="text-white text-4xl md:text-5xl drop-shadow-lg" 
                />
              </div>
              {/* Efeito de brilho interno */}
              <div className="absolute inset-2 bg-gradient-to-br from-white/20 to-transparent rounded-full" />
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight">
              Brinde{' '}
              <span className="bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                Exclusivo
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 leading-relaxed max-w-3xl mx-auto font-medium">
              Compre qualquer{' '}
              <span className="text-white font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                TN
              </span>{' '}
              e ganhe uma{' '}
              <span className="text-white font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                camiseta de brinde
              </span>
              !
            </p>
          </motion.div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="relative max-w-7xl mx-auto px-4 pb-20">
                 <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
           {/* Coluna esquerda - Como funciona */}
           <motion.div
             initial={{ opacity: 0, x: -40 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
             className="group h-full"
           >
                         <div className="relative bg-gradient-to-br from-dark-800/80 via-dark-700/60 to-dark-800/80 backdrop-blur-xl rounded-3xl p-8 md:p-10 border border-white/10 shadow-2xl hover:shadow-primary-500/20 transition-all duration-500 hover:scale-[1.02] h-full">
               {/* Efeito de borda brilhante */}
               <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary-500/20 via-transparent to-primary-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
               
               <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-4">
                 <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                   <FontAwesomeIcon icon={faCheckCircle} className="text-white text-xl" />
                 </div>
                 Como Funciona
               </h2>
               
                              <div className="space-y-6">
                 <motion.div
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ duration: 0.6, delay: 0.5 }}
                   className="bg-gradient-to-br from-dark-700/80 to-dark-600/60 rounded-2xl p-6 border border-white/10 hover:border-primary-500/30 transition-all duration-300"
                 >
                   <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-3">
                     <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                       <span className="text-white text-lg font-bold">1</span>
                     </div>
                     Faça sua compra
                   </h3>
                   <p className="text-white/90 text-base leading-relaxed">
                     Escolha qualquer modelo TN da nossa coleção exclusiva
                   </p>
                 </motion.div>

                 <motion.div
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ duration: 0.6, delay: 0.6 }}
                   className="bg-gradient-to-br from-dark-700/80 to-dark-600/60 rounded-2xl p-6 border border-white/10 hover:border-primary-500/30 transition-all duration-300"
                 >
                   <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-3">
                     <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                       <span className="text-white text-lg font-bold">2</span>
                     </div>
                     Entre em contato
                   </h3>
                   <p className="text-white/90 text-base leading-relaxed">
                     Chame no WhatsApp para escolher o tamanho da camiseta
                   </p>
                 </motion.div>

                 <motion.div
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ duration: 0.6, delay: 0.7 }}
                   className="bg-gradient-to-br from-dark-700/80 to-dark-600/60 rounded-2xl p-6 border border-white/10 hover:border-primary-500/30 transition-all duration-300"
                 >
                   <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-3">
                     <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                       <span className="text-white text-lg font-bold">3</span>
                     </div>
                     Receba seu brinde
                   </h3>
                   <p className="text-white/90 text-base leading-relaxed">
                     A camiseta será enviada junto com seu TN
                   </p>
                 </motion.div>
               </div>
            </div>
          </motion.div>

                     {/* Coluna direita - Informações importantes */}
           <motion.div
             initial={{ opacity: 0, x: 40 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
             className="group h-full"
           >
                         <div className="relative bg-gradient-to-br from-dark-800/80 via-dark-700/60 to-dark-800/80 backdrop-blur-xl rounded-3xl p-8 md:p-10 border border-white/10 shadow-2xl hover:shadow-primary-500/20 transition-all duration-500 hover:scale-[1.02] h-full">
               {/* Efeito de borda brilhante */}
               <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary-500/20 via-transparent to-primary-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
               
               <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-4">
                 <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                   <FontAwesomeIcon icon={faStar} className="text-white text-xl" />
                 </div>
                 Informações Importantes
               </h2>
               
               <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  className="bg-gradient-to-br from-dark-700/80 to-dark-600/60 rounded-2xl p-6 border border-white/10 hover:border-primary-500/30 transition-all duration-300"
                >
                  <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                      <FontAwesomeIcon icon={faShirt} className="text-white" />
                    </div>
                    Design da Camiseta
                  </h3>
                  <p className="text-white/90 text-base leading-relaxed">
                    O design da camiseta é{' '}
                    <span className="text-white font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                      aleatório
                    </span>
                    . Cada cliente recebe um design único e exclusivo!
                  </p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="bg-gradient-to-br from-dark-700/80 to-dark-600/60 rounded-2xl p-6 border border-white/10 hover:border-green-500/30 transition-all duration-300"
                >
                  <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-3">
                                         <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                       <FontAwesomeIcon icon={faWhatsappBrand} className="text-white" />
                     </div>
                    Contato Obrigatório
                  </h3>
                  <p className="text-white/90 text-base leading-relaxed">
                    <span className="text-white font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
                      Importante:
                    </span>{' '}
                    O brinde só será enviado caso o cliente entre em contato no WhatsApp falando sobre o tamanho da camiseta.
                  </p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.9 }}
                  className="bg-gradient-to-br from-dark-700/80 to-dark-600/60 rounded-2xl p-6 border border-white/10 hover:border-primary-500/30 transition-all duration-300"
                >
                                     <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-3">
                     <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                       <FontAwesomeIcon icon={faBullseye} className="text-white" />
                     </div>
                     Condições
                   </h3>
                  <ul className="text-white/90 text-base space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary-500 rounded-full" />
                      Válido para qualquer compra de TN
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary-500 rounded-full" />
                      Brinde limitado ao estoque disponível
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary-500 rounded-full" />
                      Envio automático com o produto principal
                    </li>
                  </ul>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* CTA principal com design melhorado */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1, ease: "easeOut" }}
          className="mt-16 text-center"
        >
          <div className="relative">
            {/* Efeito de fundo com gradiente */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 rounded-3xl blur-xl opacity-50" />
                         <div className="relative bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-3xl p-10 md:p-12 shadow-2xl">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Pronto para escolher seu tamanho?
              </h2>
                             <p className="text-white/90 text-lg md:text-xl mb-8 leading-relaxed">
                 Entre em contato agora e garanta sua camiseta de brinde exclusiva!
               </p>
              <motion.button
                onClick={handleWhatsApp}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group bg-white text-primary-600 hover:bg-gray-50 font-bold py-5 px-10 rounded-2xl transition-all duration-300 flex items-center gap-4 mx-auto shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                <FontAwesomeIcon icon={faWhatsappBrand} className="text-2xl group-hover:scale-110 transition-transform duration-300" />
                <span className="text-lg">Escolher Tamanho no WhatsApp</span>
                <FontAwesomeIcon icon={faArrowRight} className="text-lg group-hover:translate-x-1 transition-transform duration-300" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Navegação de volta com design melhorado */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.3 }}
          className="mt-12 text-center"
        >
          <Link 
            href="/modelos" 
            className="group inline-flex items-center gap-3 text-white/70 hover:text-white transition-all duration-300 font-medium text-lg hover:gap-4"
          >
            <span>Ver todos os modelos TN</span>
            <FontAwesomeIcon icon={faArrowRight} className="text-sm opacity-0 group-hover:opacity-100 transition-all duration-300" />
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
