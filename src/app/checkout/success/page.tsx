'use client'

import { motion } from 'framer-motion'
import { CheckCircle, ArrowRight, House, Receipt, Truck } from 'phosphor-react'
import { useRouter } from 'next/navigation'

export default function CheckoutSuccessPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-dark-900 rounded-2xl p-8 max-w-2xl mx-4 text-center"
      >
        {/* Ícone de Sucesso */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle size={40} className="text-white" />
        </motion.div>

        {/* Título */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold text-white mb-4"
        >
          Pedido Confirmado!
        </motion.h1>

        {/* Mensagem */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-gray-400 text-lg mb-8"
        >
          Seu pedido foi processado com sucesso. Você receberá um e-mail com os detalhes da compra em breve.
        </motion.p>

        {/* Informações do Pedido */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-dark-800 rounded-xl p-6 mb-8"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Próximos Passos</h2>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-left">
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-white">Confirmação por E-mail</h3>
                <p className="text-gray-400 text-sm">Você receberá um e-mail com os detalhes do pedido</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-left">
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-white">Processamento</h3>
                <p className="text-gray-400 text-sm">Seu pedido será preparado e enviado</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-left">
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-white">Entrega</h3>
                <p className="text-gray-400 text-sm">Você receberá o código de rastreamento</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Benefícios */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <div className="bg-dark-800 rounded-xl p-4">
            <Truck size={24} className="text-primary-400 mx-auto mb-2" />
            <h3 className="font-semibold text-white text-sm">Entrega Rápida</h3>
            <p className="text-gray-400 text-xs">Em até 7 dias úteis</p>
          </div>

          <div className="bg-dark-800 rounded-xl p-4">
            <CheckCircle size={24} className="text-primary-400 mx-auto mb-2" />
            <h3 className="font-semibold text-white text-sm">Garantia</h3>
            <p className="text-gray-400 text-xs">30 dias de garantia</p>
          </div>

          <div className="bg-dark-800 rounded-xl p-4">
            <Receipt size={24} className="text-primary-400 mx-auto mb-2" />
            <h3 className="font-semibold text-white text-sm">Rastreamento</h3>
            <p className="text-gray-400 text-xs">Acompanhe seu pedido</p>
          </div>
        </motion.div>

        {/* Botões */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/')}
            className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-8 py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <House size={18} />
            Voltar ao Início
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/meus-pedidos')}
            className="bg-dark-800 hover:bg-dark-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Receipt size={18} />
            Meus Pedidos
            <ArrowRight size={18} />
          </motion.button>
        </motion.div>

        {/* Mensagem Final */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-gray-500 text-sm mt-6"
        >
          Obrigado por escolher a VemPraFonte! 🎉
        </motion.p>
      </motion.div>
    </div>
  )
} 