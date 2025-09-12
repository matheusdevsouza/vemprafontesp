'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaTachometerAlt,
  FaBox,
  FaShoppingCart,
  FaUsers,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaChartLine,
  FaBell,
  FaSearch,
  FaHome
} from 'react-icons/fa';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, authenticated, loading, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!authenticated || !user?.is_admin)) {
      router.push('/login');
    }
  }, [authenticated, user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!authenticated || !user?.is_admin) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const menuItems = [
    { href: '/admin', icon: FaTachometerAlt, label: 'Dashboard', color: 'from-primary-500 to-primary-600' },
    { href: '/admin/produtos', icon: FaBox, label: 'Produtos', color: 'from-primary-500 to-primary-600' },
    { href: '/admin/pedidos', icon: FaShoppingCart, label: 'Pedidos', color: 'from-primary-500 to-primary-600' },
    { href: '/admin/usuarios', icon: FaUsers, label: 'Usuários', color: 'from-primary-500 to-primary-600' },
  ];

  const sidebarVariants = {
    open: { x: 0, opacity: 1 },
    closed: { x: '-100%', opacity: 0 }
  };

  const overlayVariants = {
    open: { opacity: 1, visibility: 'visible' as const },
    closed: { opacity: 0, visibility: 'hidden' as const }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={overlayVariants}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Always visible on desktop, animated on mobile */}
      <div className="hidden lg:flex lg:flex-col lg:w-72 bg-dark-900/95 backdrop-blur-md border-r border-dark-700/50 shadow-2xl">
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 bg-gradient-to-r from-primary-600 to-primary-700 border-b border-primary-500/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <FaChartLine className="text-white text-lg" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Admin Panel</h1>
              <p className="text-primary-100 text-xs">VemPraFonte</p>
            </div>
          </div>
        </div>

        {/* Sidebar Navigation - Flex-1 to push user section to bottom */}
        <nav className="flex-1 px-4 py-4 space-y-2">
          <div className="px-3 mb-4">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Menu Principal</div>
          </div>

          {menuItems.map((item, index) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={item.href}
                className="group flex items-center px-3 py-2.5 text-gray-300 hover:text-white transition-all duration-300 rounded-lg hover:bg-dark-800/80 border border-transparent hover:border-dark-600/50"
              >
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className="text-white" size={16} />
                </div>
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            </motion.div>
          ))}
        </nav>

        {/* User Section - Always at bottom */}
        <div className="px-4 py-4 border-t border-dark-700/50">
          <div className="px-3 mb-3">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Usuário</div>
          </div>
          
          <div className="px-3 py-2.5 bg-dark-800/50 rounded-lg border border-dark-700/30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">{user?.name}</div>
                <div className="text-xs text-gray-400 truncate">{user?.email}</div>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full mt-2 flex items-center px-3 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-300 rounded-lg border border-transparent hover:border-red-500/20"
          >
            <FaSignOutAlt className="mr-3" size={16} />
            <span className="font-medium text-sm">Sair</span>
          </button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <motion.div
        initial="closed"
        animate={sidebarOpen ? "open" : "closed"}
        variants={sidebarVariants}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed inset-y-0 left-0 z-50 w-72 bg-dark-900/95 backdrop-blur-md border-r border-dark-700/50 shadow-2xl lg:hidden flex flex-col"
      >
        {/* Mobile Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 bg-gradient-to-r from-primary-600 to-primary-700 border-b border-primary-500/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <FaChartLine className="text-white text-lg" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Admin Panel</h1>
              <p className="text-primary-100 text-xs">VemPraFonte</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white/80 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* Mobile Sidebar Navigation - Flex-1 to push user section to bottom */}
        <nav className="flex-1 px-4 py-4 space-y-2">
          <div className="px-3 mb-4">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Menu Principal</div>
          </div>

          {menuItems.map((item, index) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={item.href}
                className="group flex items-center px-3 py-2.5 text-gray-300 hover:text-white transition-all duration-300 rounded-lg hover:bg-dark-800/80 border border-transparent hover:border-dark-600/50"
                onClick={() => setSidebarOpen(false)}
              >
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className="text-white" size={16} />
                </div>
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            </motion.div>
          ))}
        </nav>

        {/* Mobile User Section - Always at bottom */}
        <div className="px-4 py-4 border-t border-dark-700/50">
          <div className="px-3 mb-3">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Usuário</div>
          </div>
          
          <div className="px-3 py-2.5 bg-dark-800/50 rounded-lg border border-dark-700/30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">{user?.name}</div>
                <div className="text-xs text-gray-400 truncate">{user?.email}</div>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full mt-2 flex items-center px-3 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-300 rounded-lg border border-transparent hover:border-red-500/20"
          >
            <FaSignOutAlt className="mr-3" size={16} />
            <span className="font-medium text-sm">Sair</span>
          </button>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-dark-900/95 backdrop-blur-md border-b border-dark-700/50 h-16 flex items-center justify-between px-6"
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-300 hover:text-white transition-colors p-2 rounded-lg hover:bg-dark-800/80"
            >
              <FaBars size={18} />
            </button>

            <div className="hidden md:flex items-center gap-3">
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
              <span className="text-gray-300 text-sm">Painel Administrativo</span>
            </div>

            {/* Home Button */}
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-2 text-primary-400 hover:text-primary-300 hover:bg-primary-500/10 transition-all duration-300 rounded-lg border border-primary-500/20 hover:border-primary-500/40"
            >
              <FaHome size={16} />
              <span className="text-sm font-medium">Voltar ao Site</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative hidden md:block">
              <input
                type="text"
                placeholder="Pesquisar..."
                className="w-56 bg-dark-800/50 border border-dark-700 rounded-lg px-3 py-2 pl-9 text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:bg-dark-800 transition-all duration-300 text-sm"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-dark-800/80">
              <FaBell size={16} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Welcome */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-white">Bem-vindo, {user?.name?.split(' ')[0]}</div>
                <div className="text-xs text-gray-400">Administrador</div>
              </div>
              <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Page content */}
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex-1 p-6 bg-dark-950 overflow-auto"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
