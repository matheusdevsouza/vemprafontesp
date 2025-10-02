'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  FaSearch, 
  FaEye, 
  FaEdit, 
  FaTrash, 
  FaUserShield,
  FaUser,
  FaUserCheck,
  FaUserTimes,
  FaEnvelope,
  FaPhone,
  FaExclamationTriangle,
  FaSpinner,
  FaBars,
  FaBox,
  FaFilter,
  FaChevronDown,
  FaChevronUp,
  FaRedo
} from 'react-icons/fa';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  emailVerified: boolean;
  lastLogin?: string;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const [error, setError] = useState<string | null>(null)
  
  // Estados para responsividade
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const router = useRouter();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        take: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter }),
        ...(roleFilter && { role: roleFilter })
      })

      const res = await fetch(`/api/admin/users?${params}`)
      if (!res.ok) throw new Error('Falha ao carregar usuários')
      
      const data = await res.json()
      setUsers(data.data.users)
      setTotalPages(data.data.pagination.pages)
      setTotalUsers(data.data.pagination.total)
    } catch (e: any) {
      setError(e.message || 'Erro inesperado')
      console.error('Erro ao buscar usuários:', e)
    } finally {
      setLoading(false)
    }
  }, [currentPage, searchTerm, statusFilter, roleFilter])

  // Hook para detectar tamanho da tela
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      
      // Auto-ajustar modo de visualização baseado no tamanho
      if (width < 768) {
        // Mobile: sempre grid
        setViewMode('grid');
      } else if (width >= 768 && width < 1024) {
        // Tablet: preferir table, mas permitir alternar
        if (viewMode === 'grid' && width >= 768) {
          // Se estava em grid e redimensionou para tablet, manter table
          setViewMode('table');
        }
      } else {
        // Desktop/Notebook: sempre table
        setViewMode('table');
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [viewMode]);

  useEffect(() => {
    fetchUsers()
  }, [currentPage, searchTerm, statusFilter, roleFilter, fetchUsers])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1) // Reset para primeira página ao buscar
  }

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value)
    setCurrentPage(1)
  }

  const handleRoleFilter = (value: string) => {
    setRoleFilter(value)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleDeleteUser = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        const res = await fetch(`/api/admin/users/${id}`, {
          method: 'DELETE'
        })
        
        if (!res.ok) {
          const errorData = await res.json()
          alert(`Erro ao excluir usuário: ${errorData.error}`)
          return
        }
        
        // Recarregar usuários após exclusão
        fetchUsers()
      } catch (error) {
        console.error('Erro ao excluir usuário:', error)
        alert('Erro ao excluir usuário')
      }
    }
  };

  const handleViewUser = (id: number) => {
    router.push(`/admin/usuarios/${id}`)
  };

  const handleEditUser = (id: number) => {
    router.push(`/admin/usuarios/${id}`)
  };

  const refreshUsers = () => {
    fetchUsers();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setRoleFilter('');
    setCurrentPage(1);
  };

  // Componente para card de usuário
  const UserCard = ({ user }: { user: User }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-dark-800/50 backdrop-blur-sm border border-dark-700/50 rounded-2xl p-4 hover:bg-dark-700/30 transition-all duration-300"
      >
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {(user.name || 'U').charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-sm mb-1 truncate">{user.name || 'Nome não informado'}</h3>
            <div className="text-gray-400 text-xs mb-2 truncate">{user.email || 'Email não informado'}</div>
            {user.phone && (
              <div className="text-gray-400 text-xs mb-2">{user.phone}</div>
            )}
            <div className="flex items-center gap-2 mb-2">
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                user.role === 'admin' 
                  ? 'bg-primary-500/20 text-primary-400' 
                  : 'bg-primary-500/20 text-primary-400'
              }`}>
                {user.role === 'admin' ? 'Admin' : 'Usuário'}
              </span>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                user.status === 'active' 
                  ? 'bg-primary-500/20 text-primary-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {user.status === 'active' ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-xs">Pedidos:</span>
            <span className="text-white text-xs font-medium">{user.orderCount || 0}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-xs">Total Gasto:</span>
            <span className="text-primary-400 text-xs font-medium">
              R$ {(user.totalSpent || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-xs">Último Login:</span>
            <span className="text-white text-xs">{user.lastLogin || 'Nunca'}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleViewUser(user.id)} 
            className="flex-1 bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 hover:text-primary-300 px-3 py-2 rounded-lg transition-all duration-300 text-center text-sm font-medium flex items-center justify-center gap-1"
          >
            <FaEye size={16} />
            Ver
          </button>
          <button 
            onClick={() => handleEditUser(user.id)} 
            className="flex-1 bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 hover:text-primary-300 px-3 py-2 rounded-lg transition-all duration-300 text-center text-sm font-medium flex items-center justify-center gap-1"
          >
            <FaEdit size={16} />
            Editar
          </button>
          <button 
            onClick={() => handleDeleteUser(user.id)} 
            className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 px-3 py-2 rounded-lg transition-all duration-300 text-center text-sm font-medium flex items-center justify-center gap-1"
          >
            <FaTrash size={16} />
            Excluir
          </button>
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="h-12 bg-gray-700 rounded mb-6"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div className="flex-1">
          <h1 className="text-xl md:text-2xl font-bold text-white mb-1">Gestão de Usuários</h1>
          <p className="text-gray-400 text-xs md:text-sm">Gerencie todos os usuários da sua loja</p>
        </div>
        
        {/* Controles do Header */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Toggle de Visualização (apenas em tablets e desktops) */}
          {!isMobile && (
            <div className="flex bg-dark-800/50 rounded-xl p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-1 ${
                  viewMode === 'table' 
                    ? 'bg-primary-500 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <FaBars size={12} />
                <span className="hidden md:inline">Tabela</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-1 ${
                  viewMode === 'grid' 
                    ? 'bg-primary-500 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <FaBox size={12} />
                <span className="hidden md:inline">Cards</span>
              </button>
            </div>
          )}
          
          <button
            onClick={refreshUsers}
            className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-3 lg:px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/25 flex items-center justify-center gap-1 text-xs lg:text-sm whitespace-nowrap"
            title="Atualizar usuários"
          >
            <FaRedo size={14} />
            <span className="hidden sm:inline">Atualizar</span>
            <span className="sm:hidden">Refresh</span>
          </button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4"
      >
        <div className="bg-dark-800/50 backdrop-blur-sm border border-dark-700/50 rounded-xl p-3 lg:p-4 border-l-4 border-primary-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs">Total</p>
              <p className="text-lg lg:text-xl font-bold text-white">{totalUsers}</p>
            </div>
            <div className="bg-primary-500 p-2 rounded-full">
              <FaUser className="text-white" size={14} />
            </div>
          </div>
        </div>

        <div className="bg-dark-800/50 backdrop-blur-sm border border-dark-700/50 rounded-xl p-3 lg:p-4 border-l-4 border-primary-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs">Ativos</p>
              <p className="text-lg lg:text-xl font-bold text-white">
                {users.filter(u => u.status === 'active').length}
              </p>
            </div>
            <div className="bg-primary-500 p-2 rounded-full">
              <FaUserCheck className="text-white" size={14} />
            </div>
          </div>
        </div>

        <div className="bg-dark-800/50 backdrop-blur-sm border border-dark-700/50 rounded-xl p-3 lg:p-4 border-l-4 border-primary-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs">Admins</p>
              <p className="text-lg lg:text-xl font-bold text-white">
                {users.filter(u => u.role === 'admin').length}
              </p>
            </div>
            <div className="bg-primary-500 p-2 rounded-full">
              <FaUserShield className="text-white" size={14} />
            </div>
          </div>
        </div>

        <div className="bg-dark-800/50 backdrop-blur-sm border border-dark-700/50 rounded-xl p-3 lg:p-4 border-l-4 border-primary-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs">Não Verificados</p>
              <p className="text-lg lg:text-xl font-bold text-white">
                {users.filter(u => !u.emailVerified).length}
              </p>
            </div>
            <div className="bg-primary-500 p-2 rounded-full">
              <FaEnvelope className="text-white" size={14} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-dark-800/50 backdrop-blur-sm border border-dark-700/50 rounded-2xl p-4 md:p-6"
      >
        {/* Mobile Filter Toggle */}
        {isMobile && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FaFilter className="text-primary-500" size={16} />
              <span className="text-white font-medium">Filtros</span>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 text-gray-400 hover:text-white transition-colors duration-300"
            >
              {showFilters ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />}
            </button>
          </div>
        )}

        {/* Filter Content */}
        <div className={`${isMobile && !showFilters ? 'hidden' : ''} space-y-4`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative sm:col-span-2 lg:col-span-1">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Buscar usuários..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full bg-dark-700/50 border border-dark-600/50 rounded-xl px-4 py-3 pl-10 text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:bg-dark-700 transition-all duration-300 text-sm md:text-base"
              />
            </div>

            {/* Role Filter */}
            <div className="relative">
              <select
                value={roleFilter}
                onChange={(e) => handleRoleFilter(e.target.value)}
                className="w-full bg-dark-700/50 border border-dark-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 focus:bg-dark-700 transition-all duration-300 text-sm md:text-base appearance-none"
              >
                <option value="">Todos os Tipos</option>
                <option value="admin">Administradores</option>
                <option value="user">Usuários</option>
              </select>
              <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="w-full bg-dark-700/50 border border-dark-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 focus:bg-dark-700 transition-all duration-300 text-sm md:text-base appearance-none"
              >
                <option value="">Todos os Status</option>
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
              </select>
              <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
            </div>
          </div>

          {/* Clear Filters Button */}
          <div className="flex justify-center sm:justify-start">
            <button
              onClick={clearFilters}
              className="bg-dark-700/50 hover:bg-dark-700 border border-dark-600/50 hover:border-dark-500/50 text-gray-300 hover:text-white px-4 py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm md:text-base"
            >
              <FaFilter size={16} />
              <span className="hidden sm:inline">Limpar Filtros</span>
              <span className="sm:hidden">Limpar</span>
            </button>
          </div>

          {/* Mobile Stats */}
          {isMobile && (
            <div className="bg-dark-700/30 rounded-xl p-3">
              <div className="text-center text-gray-400 text-sm">
                Mostrando {users.length} de {totalUsers} usuários
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-4 rounded-lg mb-6">
          <div className="flex items-center gap-2">
            <FaExclamationTriangle />
            <span>Erro ao carregar usuários: {error}</span>
          </div>
          <button
            onClick={() => fetchUsers()}
            className="mt-2 text-sm text-red-400 hover:text-red-300 underline"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-center py-12">
            <FaSpinner className="animate-spin text-primary-500 text-2xl" />
            <span className="ml-3 text-gray-400">Carregando usuários...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Users Display */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-dark-800/50 backdrop-blur-sm border border-dark-700/50 rounded-2xl overflow-hidden"
          >
            {viewMode === 'table' ? (
              /* Table View */
              <div className="overflow-x-auto max-w-full">
                <table className="w-full table-fixed">
                  <thead className="bg-dark-700/50 border-b border-dark-600/50">
                    <tr>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-40">
                        Usuário
                      </th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-20">
                        Tipo
                      </th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-20">
                        Status
                      </th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden md:table-cell w-20">
                        Pedidos
                      </th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden lg:table-cell w-24">
                        Total Gasto
                      </th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden lg:table-cell w-24">
                        Último Login
                      </th>
                      <th className="px-2 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider w-16">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-600/30">
                    {users.map((user) => (
                      <motion.tr 
                        key={user.id} 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="hover:bg-dark-700/30 transition-colors duration-300"
                      >
                        <td className="px-2 py-3 w-40">
                          <div className="flex items-center gap-2">
                            <div className="flex-shrink-0 h-8 w-8">
                              <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center">
                                <span className="text-white font-medium text-xs">
                                  {(user.name || 'U').charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-white font-medium text-xs truncate">{user.name || 'Nome não informado'}</div>
                              <div className="text-gray-400 text-xs truncate">{user.email || 'Email não informado'}</div>
                              {user.phone && (
                                <div className="text-gray-400 text-xs truncate">{user.phone}</div>
                              )}
                              {/* Info adicional visível em mobile */}
                              <div className="md:hidden flex items-center gap-1 mt-1">
                                <span className="text-xs text-gray-400">{user.orderCount || 0} pedidos</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-3 w-20">
                          <span className={`inline-flex px-1 py-0.5 text-xs font-medium rounded-full ${
                            user.role === 'admin' 
                              ? 'bg-primary-500/20 text-primary-400' 
                              : 'bg-primary-500/20 text-primary-400'
                          }`}>
                            {user.role === 'admin' ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td className="px-2 py-3 w-20">
                          <span className={`inline-flex px-1 py-0.5 text-xs font-medium rounded-full ${
                            user.status === 'active' 
                              ? 'bg-primary-500/20 text-primary-400' 
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {user.status === 'active' ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-2 py-3 hidden md:table-cell w-20">
                          <span className="text-gray-300 text-xs">
                            {user.orderCount || 0}
                          </span>
                        </td>
                        <td className="px-2 py-3 hidden lg:table-cell w-24">
                          <span className="text-gray-300 text-xs">
                            R$ {(user.totalSpent || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="px-2 py-3 hidden lg:table-cell w-24">
                          <span className="text-gray-300 text-xs">
                            {user.lastLogin || 'Nunca'}
                          </span>
                        </td>
                        <td className="px-2 py-3 w-16">
                          <div className="flex items-center justify-center gap-0.5">
                            <button 
                              onClick={() => handleViewUser(user.id)}
                              className="p-0.5 text-primary-400 hover:text-primary-300 hover:bg-primary-500/10 rounded transition-all duration-300"
                            >
                              <FaEye size={14} />
                            </button>
                            <button 
                              onClick={() => handleEditUser(user.id)}
                              className="p-0.5 text-primary-400 hover:text-primary-300 hover:bg-primary-500/10 rounded transition-all duration-300"
                            >
                              <FaEdit size={14} />
                            </button>
                            <button 
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-0.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-all duration-300"
                            >
                              <FaTrash size={14} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Grid View */
              <div className="p-4 lg:p-6">
                {users && users.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                    {users.map((user) => (
                      <UserCard key={user.id} user={user} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400">
                      <FaUser className="mx-auto mb-4" size={48} />
                      <h3 className="text-lg font-medium text-gray-300 mb-2">Nenhum usuário encontrado</h3>
                      <p className="text-gray-500">
                        {searchTerm || statusFilter || roleFilter 
                          ? 'Tente ajustar os filtros de busca'
                          : 'Não há usuários cadastrados no sistema'
                        }
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Empty State */}
            {users.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="text-gray-400">
                  <FaUser className="mx-auto mb-4" size={48} />
                  <h3 className="text-lg font-medium text-gray-300 mb-2">
                    {searchTerm || statusFilter || roleFilter 
                      ? 'Nenhum usuário encontrado com os filtros aplicados'
                      : 'Nenhum usuário encontrado'
                    }
                  </h3>
                  <p className="text-gray-500">
                    {searchTerm || statusFilter || roleFilter 
                      ? 'Tente ajustar os filtros de busca'
                      : 'Não há usuários cadastrados no sistema'
                    }
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-dark-800/50 backdrop-blur-sm border border-dark-700/50 rounded-2xl p-4 lg:p-6"
        >
          <div className="text-gray-400 text-sm text-center md:text-left">
            Mostrando {users.length} de {totalUsers} usuários
          </div>
          
          <div className="flex items-center justify-center gap-2">
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 text-gray-400 hover:text-white hover:bg-dark-700/50 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm lg:text-base"
            >
              <span className="hidden md:inline">Anterior</span>
              <span className="md:hidden">‹</span>
            </button>
            
            <div className="flex items-center gap-1">
              {/* Páginas visíveis baseadas no tamanho da tela */}
              {(() => {
                const maxVisible = isMobile ? 3 : 5;
                const startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                const endPage = Math.min(totalPages, startPage + maxVisible - 1);
                const actualStartPage = Math.max(1, endPage - maxVisible + 1);
                
                const pages = [];
                
                // Primeira página se não estiver visível
                if (actualStartPage > 1) {
                  pages.push(
                    <button
                      key={1}
                      onClick={() => handlePageChange(1)}
                      className="px-2 lg:px-3 py-2 rounded-lg transition-all duration-300 text-gray-400 hover:text-white hover:bg-dark-700/50 text-sm lg:text-base"
                    >
                      1
                    </button>
                  );
                  if (actualStartPage > 2) {
                    pages.push(
                      <span key="ellipsis1" className="px-2 text-gray-500 text-sm lg:text-base">...</span>
                    );
                  }
                }
                
                // Páginas visíveis
                for (let i = actualStartPage; i <= endPage; i++) {
                  pages.push(
                    <button
                      key={i}
                      onClick={() => handlePageChange(i)}
                      className={`px-2 lg:px-3 py-2 rounded-lg transition-all duration-300 text-sm lg:text-base ${
                        i === currentPage 
                          ? 'bg-primary-500 text-white' 
                          : 'text-gray-400 hover:text-white hover:bg-dark-700/50'
                      }`}
                    >
                      {i}
                    </button>
                  );
                }
                
                // Última página se não estiver visível
                if (endPage < totalPages) {
                  if (endPage < totalPages - 1) {
                    pages.push(
                      <span key="ellipsis2" className="px-2 text-gray-500 text-sm lg:text-base">...</span>
                    );
                  }
                  pages.push(
                    <button
                      key={totalPages}
                      onClick={() => handlePageChange(totalPages)}
                      className="px-2 lg:px-3 py-2 rounded-lg transition-all duration-300 text-gray-400 hover:text-white hover:bg-dark-700/50 text-sm lg:text-base"
                    >
                      {totalPages}
                    </button>
                  );
                }
                
                return pages;
              })()}
            </div>
            
            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-gray-400 hover:text-white hover:bg-dark-700/50 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm lg:text-base"
            >
              <span className="hidden md:inline">Próximo</span>
              <span className="md:hidden">›</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
