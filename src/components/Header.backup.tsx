'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, User, List, X, MagnifyingGlass, Truck, UserPlus, EnvelopeSimple, SignOut, AddressBook, UserCircle, Receipt } from 'phosphor-react'
import Image from 'next/image'
import { useCart } from '@/contexts/CartContext'
import SidebarCart from './SidebarCart'
import { useAuth } from '@/contexts/AuthContext';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [showTrackingModal, setShowTrackingModal] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const { state: cartState, isCartSidebarOpen, setIsCartSidebarOpen } = useCart()
  const { user, authenticated, logout } = useAuth();

  // Estados para o searchbar
  const [isSearching, setIsSearching] = useState(false)

  // Funções para o searchbar
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setIsSearching(true)
      window.location.href = `/pesquisa?q=${encodeURIComponent(searchQuery.trim())}`
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [userMenuOpen])

  const menuItems = [
    { label: 'Início', href: '/' },
    { label: 'Produtos', href: '/produtos' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Contato', href: '/contato' },
  ]

  return (
    <header className="fixed top-0 w-full z-50">
      {/* Header Principal */}
      <div className="bg-dark-950/95 backdrop-blur-md border-b border-dark-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.a
              href="/"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.12 }}
              className="flex items-center cursor-pointer group"
              title="Ir para a página inicial"
            >
              <div className="relative w-12 h-12 transition-transform duration-200 group-hover:scale-110 group-hover:rounded-full overflow-hidden">
                <Image
                  src="/images/Logo.png"
                  alt="VemPraFonte"
                  fill
                  sizes="48px"
                  className="object-contain"
                  priority
                  style={{ borderRadius: 'inherit', filter: 'none' }}
                />
              </div>
            </motion.a>

            {/* Barra de Pesquisa */}
            <div className="flex-1 max-w-2xl mx-8 hidden md:block">
              <motion.form
                onSubmit={handleSearch}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative flex items-center"
              >
                <input
                  type="text"
                  placeholder="Pesquisar produtos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                  className="w-full bg-dark-800/50 border border-dark-700 rounded-full px-6 py-3 pl-6 pr-12 text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:bg-dark-800 transition-all duration-300"
                />
                {searchQuery && (
                  <motion.button
                    type="button"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={clearSearch}
                    className="absolute right-4 text-gray-400 hover:text-white transition-colors w-6 h-6 flex items-center justify-center"
                  >
                    <X size={16} />
                  </motion.button>
                )}
                <button
                  type="submit"
                  disabled={!searchQuery.trim() || isSearching}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-primary-500 hover:bg-primary-600 disabled:bg-dark-700 disabled:cursor-not-allowed text-white rounded-full p-2 transition-all duration-200 disabled:opacity-50"
                >
                  <MagnifyingGlass size={16} />
                </button>
              </motion.form>
            </div>

            {/* Ações do usuário */}
            <div className="flex items-center space-x-4 relative">
              {/* Usuário */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 text-gray-300 hover:text-primary-400 transition-colors duration-300 hover:bg-dark-800/50 rounded-full relative"
                title="Minha Conta"
                onClick={() => setUserMenuOpen((open) => !open)}
                id="user-menu-trigger"
              >
                <User size={22} />
              </motion.button>
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    ref={userMenuRef}
                    className="absolute z-50 min-w-[220px] bg-dark-900 border border-dark-700 rounded-xl shadow-lg py-2"
                    style={{ right: 0, top: 'calc(100% + 8px)' }}
                    initial={{ opacity: 0, scale: 0.97, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97, y: -8 }}
                    transition={{ duration: 0.18 }}
                  >
                    {authenticated && user ? (
                      <>
                        <div className="px-5 py-3 text-white font-semibold flex items-center gap-3 border-b border-dark-800">
                          <User size={22} className="text-primary-400" />
                          {`Olá, ${(user.display_name || user.name.split(' ')[0])}!`}
                        </div>
                        <a href="/perfil" className="flex items-center gap-3 px-5 py-3 text-white hover:bg-dark-800/80 transition-colors">
                          <UserCircle size={18} className="text-primary-400" />
                          Perfil
                        </a>
                        <a href="/meus-pedidos" className="flex items-center gap-3 px-5 py-3 text-white hover:bg-dark-800/80 transition-colors">
                          <Receipt size={18} className="text-primary-400" />
                          Meus Pedidos
                        </a>
                        <a href="/enderecos" className="flex items-center gap-3 px-5 py-3 text-white hover:bg-dark-800/80 transition-colors">
                          <AddressBook size={18} className="text-primary-400" />
                          Endereços
                        </a>
                        {user.is_admin && (
                          <a href="/admin" className="flex items-center gap-3 px-5 py-3 text-white hover:bg-dark-800/80 transition-colors border-t border-dark-800">
                            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">A</span>
                            </div>
                            Dashboard Admin
                          </a>
                        )}
                        <button
                          onClick={async () => { await logout(); setUserMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-5 py-3 text-red-400 hover:bg-dark-800/80 transition-colors border-t border-dark-800 mt-1"
                        >
                          <SignOut size={18} className="text-red-400" />
                          Sair
                        </button>
                      </>
                    ) : (
                      <>
                        <a href="/login" className="flex items-center gap-3 px-5 py-3 text-white hover:bg-dark-800/80 transition-colors">
                          <User size={18} className="text-primary-400" />
                          Fazer Login
                        </a>
                        <a href="/criar-conta" className="flex items-center gap-3 px-5 py-3 text-white hover:bg-dark-800/80 transition-colors">
                          <UserPlus size={18} className="text-primary-400" />
                          Criar Conta
                        </a>
                        <div className="border-t border-dark-700 my-1" />
                        <a href="/contato" className="flex items-center gap-3 px-5 py-3 text-white hover:bg-dark-800/80 transition-colors">
                          <EnvelopeSimple size={18} className="text-primary-400" />
                          Contato
                        </a>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Rastreamento */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 text-gray-300 hover:text-primary-400 transition-colors duration-300 hover:bg-dark-800/50 rounded-full"
                title="Rastrear Pedido"
                onClick={() => setShowTrackingModal(true)}
              >
                <Truck size={22} />
              </motion.button>

              {/* Carrinho */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsCartSidebarOpen(true)}
                className="relative p-3 text-gray-300 hover:text-primary-400 transition-colors duration-300 hover:bg-dark-800/50 rounded-full"
                title="Carrinho"
              >
                <ShoppingCart size={22} />
                {cartState.itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-semibold">
                    {cartState.itemCount}
                  </span>
                )}
              </motion.button>

              {/* Menu Mobile */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-3 text-gray-300 hover:text-primary-400 transition-colors duration-300"
              >
                {isMenuOpen ? <X size={24} /> : <List size={24} />}
              </button>
            </div>
          </div>

          {/* Barra de Pesquisa Mobile */}
          <div className="md:hidden mt-4">
            <form onSubmit={handleSearch} className="relative flex items-center">
              <input
                type="text"
                placeholder="Pesquisar produtos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                className="w-full bg-dark-800/50 border border-dark-700 rounded-full px-6 py-3 pl-6 pr-12 text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-all duration-300"
              />
              {searchQuery && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={clearSearch}
                  className="absolute right-4 text-gray-400 hover:text-white transition-colors w-6 h-6 flex items-center justify-center"
                >
                  <X size={16} />
                </motion.button>
              )}
              <button
                type="submit"
                disabled={!searchQuery.trim() || isSearching}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-primary-500 hover:bg-primary-600 disabled:bg-dark-700 disabled:cursor-not-allowed text-white rounded-full p-2 transition-all duration-200 disabled:opacity-50"
              >
                <MagnifyingGlass size={16} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Barra de Navegação */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 shadow-lg">
        <div className="container mx-auto px-4">
          {/* Menu Desktop */}
          <nav className="hidden md:flex items-center justify-center space-x-8 py-3">
            {menuItems.map((item, index) => (
              <motion.a
                key={item.href}
                href={item.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="text-white hover:text-primary-100 transition-colors duration-300 font-medium text-sm uppercase tracking-wide hover:bg-white/10 px-3 py-2 rounded-md"
              >
                {item.label}
              </motion.a>
            ))}
          </nav>

          {/* Menu Mobile */}
          {isMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden py-4 space-y-2"
            >
              {menuItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="block py-3 px-4 text-white hover:text-primary-100 hover:bg-white/10 transition-all duration-300 rounded-md font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
            </motion.nav>
          )}
        </div>
      </div>

      {/* Modal de Rastreamento */}
      <AnimatePresence>
        {showTrackingModal && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-dark-900 border border-dark-700 rounded-2xl shadow-2xl p-8 max-w-lg w-full text-center"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.22 }}
            >
              <Truck size={40} className="mx-auto mb-4 text-primary-400" />
              <h2 className="text-xl font-bold text-white mb-2">Rastreamento de Pedido</h2>
              <div className="flex flex-col md:flex-row items-center justify-center gap-2 text-gray-300 mb-6">
                <span>Você será redirecionado para o site de rastreamento externo <span className='text-primary-400 font-semibold'>17TRACK</span>. Deseja continuar?</span>
              </div>
              <div className="flex gap-4 justify-center">
                <button
                  className="px-6 py-2 rounded-lg bg-dark-800 text-gray-300 border border-dark-700 hover:bg-dark-700 transition-colors font-semibold"
                  onClick={() => setShowTrackingModal(false)}
                >
                  Cancelar
                </button>
                <button
                  className="px-6 py-2 rounded-lg bg-primary-500 text-white font-bold hover:bg-primary-600 transition-colors"
                  onClick={() => {
                    window.open('https://www.17track.net/pt', '_blank')
                    setShowTrackingModal(false)
                  }}
                >
                  Ir para rastreamento
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar do Carrinho */}
      <SidebarCart open={isCartSidebarOpen} onClose={() => setIsCartSidebarOpen(false)} />
    </header>
  )
} 