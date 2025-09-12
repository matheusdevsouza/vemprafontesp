import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, X, Plus, Minus, Trash } from 'phosphor-react'
import Image from 'next/image'
import { useCart } from '@/contexts/CartContext'

interface SidebarCartProps {
  open: boolean
  onClose: () => void
}

export default function SidebarCart({ open, onClose }: SidebarCartProps) {
  const { state, addItem, removeItem, updateQuantity, clearCart } = useCart()
  
  // ✅ Verificar se pode ir para checkout (apenas itens no carrinho)
  const canProceedToCheckout = state.items.length > 0

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'tween', duration: 0.28 }}
          className="fixed top-0 right-0 h-full w-full max-w-md z-[200] bg-dark-900 border-l border-dark-700 shadow-2xl flex flex-col"
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-dark-700">
            <div className="flex items-center gap-2">
              <ShoppingCart size={24} className="text-primary-400" />
              <span className="text-lg font-bold text-white">Seu Carrinho</span>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-primary-400 transition-colors">
              <X size={28} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            {state.items.length === 0 ? (
              <div className="text-center text-gray-400 mt-16">
                <ShoppingCart size={48} className="mx-auto mb-4 opacity-40" />
                Seu carrinho está vazio.
              </div>
            ) : (
              <>
                <ul className="space-y-6">
                  {state.items.map(item => (
                    <li key={item.product.id} className="flex gap-4 items-center border-b border-dark-800 pb-4">
                      <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-dark-800">
                        <Image
                          src={item.image || '/images/Logo.png'}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white truncate mb-1">{item.product.name}</div>
                        {item.size && (
                          <div className="text-sm text-gray-400 mb-1">Tamanho: {item.size}</div>
                        )}
                        <div className="text-primary-400 font-bold text-base">R$ {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                        <div className="flex items-center gap-2 mt-2">
                          <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="p-1 rounded bg-dark-800 text-gray-300 hover:bg-dark-700"><Minus size={16} /></button>
                          <span className="px-2 text-white font-semibold">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="p-1 rounded bg-dark-800 text-gray-300 hover:bg-dark-700"><Plus size={16} /></button>
                          <button onClick={() => removeItem(item.product.id)} className="ml-4 p-1 rounded bg-dark-800 text-red-400 hover:bg-red-600"><Trash size={16} /></button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                {/* Limpar Carrinho */}
                {state.items.length > 0 && (
                  <div className="flex justify-center mt-6">
                    <button
                      className="py-2 px-6 rounded-xl bg-dark-800 text-gray-400 hover:bg-dark-700 transition-colors text-sm"
                      onClick={clearCart}
                    >
                      Limpar Carrinho
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="border-t border-dark-700 px-6 py-5 bg-dark-950 z-[300]">
            {/* ✅ Subtotal */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300 font-semibold">Subtotal</span>
              <span className="text-lg font-bold text-primary-400">
                R$ {state.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            
            {/* ✅ Frete - SEMPRE GRÁTIS */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Frete</span>
              <span className="text-sm text-green-400 font-bold">
                GRÁTIS!
              </span>
            </div>
            
            {/* ✅ Total - Com frete grátis incluído */}
            <div className="flex items-center justify-between mb-4 pt-2 border-t border-dark-700">
              <span className="text-gray-300 font-semibold">Total</span>
              <span className="text-xl font-bold text-primary-400">
                R$ {state.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* ✅ Botão de checkout - Sempre habilitado com itens */}
            <button
              onClick={() => {
                onClose()
                window.location.href = '/checkout'
              }}
              disabled={!canProceedToCheckout}
              className={`w-full py-3 px-6 rounded-xl font-semibold transition-all ${
                canProceedToCheckout
                  ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                  : 'bg-dark-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              {canProceedToCheckout ? 'Ir para Checkout' : 'Carrinho vazio'}
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
} 