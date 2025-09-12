'use client';

import { useState, useEffect, useCallback } from 'react';
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
  FaSpinner
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestão de Usuários</h1>
          <p className="text-gray-400 mt-2">Gerencie todos os usuários da sua loja</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total de Usuários</p>
              <p className="text-2xl font-bold text-white">{totalUsers}</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-full">
              <FaUser className="text-white" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Usuários Ativos</p>
              <p className="text-2xl font-bold text-white">
                {users.filter(u => u.status === 'active').length}
              </p>
            </div>
            <div className="bg-green-500 p-3 rounded-full">
              <FaUserCheck className="text-white" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Administradores</p>
              <p className="text-2xl font-bold text-white">
                {users.filter(u => u.role === 'admin').length}
              </p>
            </div>
            <div className="bg-purple-500 p-3 rounded-full">
              <FaUserShield className="text-white" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Email Não Verificado</p>
              <p className="text-2xl font-bold text-white">
                {users.filter(u => !u.emailVerified).length}
              </p>
            </div>
            <div className="bg-yellow-500 p-3 rounded-full">
              <FaEnvelope className="text-white" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar usuários..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => handleRoleFilter(e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">Todos os Tipos</option>
            <option value="admin">Administradores</option>
            <option value="user">Usuários</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">Todos os Status</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>
        </div>
      </div>

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
            <FaSpinner className="animate-spin text-blue-500 text-2xl" />
            <span className="ml-3 text-gray-400">Carregando usuários...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Users Table */}
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Usuário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Pedidos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Total Gasto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Último Login
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                              <span className="text-white font-medium text-sm">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">{user.name}</div>
                            <div className="text-sm text-gray-400">{user.email}</div>
                            {user.phone && (
                              <div className="text-sm text-gray-400">{user.phone}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role === 'admin' ? 'Admin' : 'Usuário'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.status === 'active' ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {user.orderCount} pedidos
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        R$ {user.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {user.lastLogin}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleViewUser(user.id)}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            <FaEye size={16} />
                          </button>
                          <button 
                            onClick={() => handleEditUser(user.id)}
                            className="text-yellow-400 hover:text-yellow-300 transition-colors"
                          >
                            <FaEdit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <FaTrash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Empty State */}
          {users.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">
                {searchTerm || statusFilter || roleFilter 
                  ? 'Nenhum usuário encontrado com os filtros aplicados'
                  : 'Nenhum usuário encontrado'
                }
              </div>
              <div className="text-gray-500 text-sm">
                {searchTerm || statusFilter || roleFilter 
                  ? 'Tente ajustar os filtros de busca'
                  : 'Não há usuários cadastrados no sistema'
                }
              </div>
            </div>
          )}
        </>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Mostrando {users.length} de {totalUsers} usuários
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i + 1)}
                  className={`px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors ${
                    currentPage === i + 1 ? 'bg-blue-600 text-white' : ''
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próximo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
