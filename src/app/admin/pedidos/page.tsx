'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  FaSearch, 
  FaEye, 
  FaEdit, 
  FaTruck,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaSpinner,
  FaRedo,
  FaBars,
  FaBox,
  FaFilter,
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa';
import Link from 'next/link'

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  status: string;
  payment_status: string;
  createdAt: string;
  tracking_code?: string;
  tracking_url?: string;
  shipping_company?: string;
  shipping_status?: string;
  items: Array<{
    id: number;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
}

interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  statusBreakdown: Record<string, number>;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  
  // Estados para responsividade
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: searchTerm,
        status: selectedStatus,
        paymentStatus: selectedPaymentStatus,
        dateFilter
      });

      const response = await fetch(`/api/admin/orders?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setOrders(result.data.orders);
        setStats(result.data.stats);
        setTotalPages(result.data.pagination.pages);
        setTotalOrders(result.data.pagination.total);
      } else {
        setError(result.error || 'Erro ao carregar pedidos');
      }
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, selectedStatus, selectedPaymentStatus, dateFilter]);

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
    fetchOrders();
  }, [fetchOrders]);

  const refreshOrders = () => {
    fetchOrders();
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800', icon: FaClock };
      case 'processing':
        return { label: 'Processando', color: 'bg-blue-100 text-blue-800', icon: FaClock };
      case 'shipped':
        return { label: 'Enviado', color: 'bg-purple-100 text-purple-800', icon: FaTruck };
      case 'delivered':
        return { label: 'Entregue', color: 'bg-green-100 text-green-800', icon: FaCheckCircle };
      case 'cancelled':
        return { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: FaExclamationTriangle };
      default:
        return { label: 'Desconhecido', color: 'bg-gray-100 text-gray-800', icon: FaClock };
    }
  };

  const getPaymentStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' };
      case 'paid':
        return { label: 'Pago', color: 'bg-green-100 text-green-800' };
      case 'failed':
        return { label: 'Falhou', color: 'bg-red-100 text-red-800' };
      default:
        return { label: 'Desconhecido', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('all');
    setSelectedPaymentStatus('all');
    setDateFilter('all');
    setPage(1);
  };

  // Componente para card de pedido
  const OrderCard = ({ order }: { order: Order }) => {
    const statusInfo = getStatusInfo(order.status);
    const paymentInfo = getPaymentStatusInfo(order.payment_status);
    const StatusIcon = statusInfo.icon;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-dark-800/50 backdrop-blur-sm border border-dark-700/50 rounded-2xl p-4 hover:bg-dark-700/30 transition-all duration-300"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-white font-semibold text-sm mb-1">{order.order_number}</h3>
            <div className="text-gray-400 text-xs mb-2">{order.items.length} item(s)</div>
            <div className="text-primary-400 font-bold text-lg">
              R$ {order.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="text-right">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
              <StatusIcon className="mr-1" size={10} />
              {statusInfo.label}
            </span>
          </div>
        </div>
        
        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-xs">Cliente:</span>
            <span className="text-white text-xs">{order.customer_name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-xs">Email:</span>
            <span className="text-white text-xs truncate">{order.customer_email}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-xs">Pagamento:</span>
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${paymentInfo.color}`}>
              {paymentInfo.label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-xs">Data:</span>
            <span className="text-white text-xs">{new Date(order.createdAt).toLocaleDateString('pt-BR')}</span>
          </div>
          {order.tracking_code && (
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-xs">Rastreio:</span>
              <span className="text-green-400 text-xs font-medium">{order.tracking_code}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Link 
            href={`/admin/pedidos/${order.id}`} 
            className="flex-1 bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 hover:text-primary-300 px-3 py-2 rounded-lg transition-all duration-300 text-center text-sm font-medium flex items-center justify-center gap-1"
          >
            <FaEye size={16} />
            Ver
          </Link>
          <Link 
            href={`/admin/pedidos/${order.id}`} 
            className="flex-1 bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 hover:text-primary-300 px-3 py-2 rounded-lg transition-all duration-300 text-center text-sm font-medium flex items-center justify-center gap-1"
          >
            <FaEdit size={16} />
            Editar
          </Link>
        </div>
      </motion.div>
    );
  };

  if (loading && orders.length === 0) {
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

  if (error && orders.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
          <FaExclamationTriangle className="mx-auto text-red-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-red-300 mb-2">Erro ao carregar pedidos</h3>
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={refreshOrders}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-300"
          >
            Tentar novamente
          </button>
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
          <h1 className="text-xl md:text-2xl font-bold text-white mb-1">Gestão de Pedidos</h1>
          <p className="text-gray-400 text-xs md:text-sm">Gerencie todos os pedidos da sua loja</p>
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
            onClick={refreshOrders}
            className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-3 lg:px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/25 flex items-center justify-center gap-1 text-xs lg:text-sm whitespace-nowrap"
            title="Atualizar pedidos"
          >
            <FaRedo size={14} />
            <span className="hidden sm:inline">Atualizar</span>
            <span className="sm:hidden">Refresh</span>
          </button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4"
        >
          <div className="bg-dark-800/50 backdrop-blur-sm border border-dark-700/50 rounded-xl p-3 lg:p-4 border-l-4 border-primary-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs">Pendentes</p>
                <p className="text-lg lg:text-xl font-bold text-white">
                  {stats.statusBreakdown.pending || 0}
                </p>
              </div>
              <div className="bg-primary-500 p-2 rounded-full">
                <FaClock className="text-white" size={14} />
              </div>
            </div>
          </div>

          <div className="bg-dark-800/50 backdrop-blur-sm border border-dark-700/50 rounded-xl p-3 lg:p-4 border-l-4 border-primary-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs">Processando</p>
                <p className="text-lg lg:text-xl font-bold text-white">
                  {stats.statusBreakdown.processing || 0}
                </p>
              </div>
              <div className="bg-primary-500 p-2 rounded-full">
                <FaClock className="text-white" size={14} />
              </div>
            </div>
          </div>

          <div className="bg-dark-800/50 backdrop-blur-sm border border-dark-700/50 rounded-xl p-3 lg:p-4 border-l-4 border-primary-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs">Enviados</p>
                <p className="text-lg lg:text-xl font-bold text-white">
                  {stats.statusBreakdown.shipped || 0}
                </p>
              </div>
              <div className="bg-primary-500 p-2 rounded-full">
                <FaTruck className="text-white" size={14} />
              </div>
            </div>
          </div>

          <div className="bg-dark-800/50 backdrop-blur-sm border border-dark-700/50 rounded-xl p-3 lg:p-4 border-l-4 border-primary-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs">Entregues</p>
                <p className="text-lg lg:text-xl font-bold text-white">
                  {stats.statusBreakdown.delivered || 0}
                </p>
              </div>
              <div className="bg-primary-500 p-2 rounded-full">
                <FaCheckCircle className="text-white" size={14} />
              </div>
            </div>
          </div>
        </motion.div>
      )}

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative sm:col-span-2 lg:col-span-1">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Buscar pedidos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-dark-700/50 border border-dark-600/50 rounded-xl px-4 py-3 pl-10 text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:bg-dark-700 transition-all duration-300 text-sm md:text-base"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full bg-dark-700/50 border border-dark-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 focus:bg-dark-700 transition-all duration-300 text-sm md:text-base appearance-none"
              >
                <option value="all">Todos os Status</option>
                <option value="pending">Pendente</option>
                <option value="processing">Processando</option>
                <option value="shipped">Enviado</option>
                <option value="delivered">Entregue</option>
                <option value="cancelled">Cancelado</option>
              </select>
              <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
            </div>

            {/* Payment Status Filter */}
            <div className="relative">
              <select
                value={selectedPaymentStatus}
                onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                className="w-full bg-dark-700/50 border border-dark-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 focus:bg-dark-700 transition-all duration-300 text-sm md:text-base appearance-none"
              >
                <option value="all">Todos os Pagamentos</option>
                <option value="pending">Pendente</option>
                <option value="paid">Pago</option>
                <option value="failed">Falhou</option>
              </select>
              <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
            </div>

            {/* Date Filter */}
            <div className="relative">
              <select 
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full bg-dark-700/50 border border-dark-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 focus:bg-dark-700 transition-all duration-300 text-sm md:text-base appearance-none"
              >
                <option value="all">Todos</option>
                <option value="today">Hoje</option>
                <option value="week">Esta Semana</option>
                <option value="month">Este Mês</option>
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
                Mostrando {orders.length} de {totalOrders} pedidos
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Orders Display */}
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
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-32">
                    Pedido
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden md:table-cell w-40">
                    Cliente
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-20">
                    Total
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-24">
                    Status
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden md:table-cell w-24">
                    Pagamento
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden lg:table-cell w-32">
                    Rastreio
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden sm:table-cell w-20">
                    Data
                  </th>
                  <th className="px-2 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider w-16">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-600/30">
                {orders.map((order) => {
                  const statusInfo = getStatusInfo(order.status);
                  const paymentInfo = getPaymentStatusInfo(order.payment_status);
                  const StatusIcon = statusInfo.icon;
                  
                  return (
                    <motion.tr 
                      key={order.id} 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="hover:bg-dark-700/30 transition-colors duration-300"
                    >
                      <td className="px-2 py-3 w-32">
                        <div className="truncate">
                          <div className="text-white font-medium text-xs truncate">{order.order_number}</div>
                          <div className="text-gray-400 text-xs">{order.items.length} item(s)</div>
                          {/* Cliente visível em mobile */}
                          <div className="md:hidden flex items-center gap-1 mt-1">
                            <span className="text-gray-400 text-xs truncate">{order.customer_name}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-3 hidden md:table-cell w-40">
                        <div className="truncate">
                          <div className="text-white font-medium text-xs truncate">{order.customer_name}</div>
                          <div className="text-gray-400 text-xs truncate">{order.customer_email}</div>
                        </div>
                      </td>
                      <td className="px-2 py-3 w-20">
                        <span className="text-white font-semibold text-xs">
                          R$ {order.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-2 py-3 w-24">
                        <span className={`inline-flex items-center px-1 py-0.5 text-xs font-medium rounded-full ${statusInfo.color}`}>
                          <StatusIcon className="mr-1" size={8} />
                          <span className="truncate">{statusInfo.label}</span>
                        </span>
                      </td>
                      <td className="px-2 py-3 hidden md:table-cell w-24">
                        <span className={`inline-flex px-1 py-0.5 text-xs font-medium rounded-full ${paymentInfo.color} truncate`}>
                          {paymentInfo.label}
                        </span>
                      </td>
                      <td className="px-2 py-3 hidden lg:table-cell w-32">
                        {order.tracking_code ? (
                          <div className="text-xs truncate">
                            <div className="text-green-400 font-medium truncate">{order.tracking_code}</div>
                            {order.shipping_company && (
                              <div className="text-gray-400 text-xs truncate">{order.shipping_company}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-500 text-xs">Sem rastreio</span>
                        )}
                      </td>
                      <td className="px-2 py-3 hidden sm:table-cell w-20">
                        <span className="text-gray-300 text-xs">
                          {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </td>
                      <td className="px-2 py-3 w-16">
                        <div className="flex items-center justify-center gap-0.5">
                          <Link href={`/admin/pedidos/${order.id}`} className="p-0.5 text-primary-400 hover:text-primary-300 hover:bg-primary-500/10 rounded transition-all duration-300">
                            <FaEye size={14} />
                          </Link>
                          <Link href={`/admin/pedidos/${order.id}`} className="p-0.5 text-primary-400 hover:text-primary-300 hover:bg-primary-500/10 rounded transition-all duration-300">
                            <FaEdit size={14} />
                          </Link>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Grid View */
          <div className="p-4 lg:p-6">
            {orders && orders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                {orders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400">
                  <FaTruck className="mx-auto mb-4" size={48} />
                  <h3 className="text-lg font-medium text-gray-300 mb-2">Nenhum pedido encontrado</h3>
                  <p className="text-gray-500">Tente ajustar os filtros ou aguarde novos pedidos.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && orders.length > 0 && (
          <div className="flex items-center justify-center py-8">
            <FaSpinner className="animate-spin text-primary-500 mr-2" size={20} />
            <span className="text-gray-400">Carregando...</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && orders.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400">
              <FaTruck className="mx-auto mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-300 mb-2">Nenhum pedido encontrado</h3>
              <p className="text-gray-500">Tente ajustar os filtros ou aguarde novos pedidos.</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-dark-800/50 backdrop-blur-sm border border-dark-700/50 rounded-2xl p-4 lg:p-6"
        >
          <div className="text-gray-400 text-sm text-center md:text-left">
            Mostrando {orders.length} de {totalOrders} pedidos
          </div>
          
          <div className="flex items-center justify-center gap-2">
            <button 
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-2 text-gray-400 hover:text-white hover:bg-dark-700/50 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm lg:text-base"
            >
              <span className="hidden md:inline">Anterior</span>
              <span className="md:hidden">‹</span>
            </button>
            
            <div className="flex items-center gap-1">
              {/* Páginas visíveis baseadas no tamanho da tela */}
              {(() => {
                const maxVisible = isMobile ? 3 : 5;
                const startPage = Math.max(1, page - Math.floor(maxVisible / 2));
                const endPage = Math.min(totalPages, startPage + maxVisible - 1);
                const actualStartPage = Math.max(1, endPage - maxVisible + 1);
                
                const pages = [];
                
                // Primeira página se não estiver visível
                if (actualStartPage > 1) {
                  pages.push(
                    <button
                      key={1}
                      onClick={() => setPage(1)}
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
                      onClick={() => setPage(i)}
                      className={`px-2 lg:px-3 py-2 rounded-lg transition-all duration-300 text-sm lg:text-base ${
                        i === page 
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
                      onClick={() => setPage(totalPages)}
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
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
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
