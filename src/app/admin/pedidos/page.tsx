'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  FaSearch, 
  FaEye, 
  FaEdit, 
  FaTruck,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaSpinner,
  FaRedo
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestão de Pedidos</h1>
          <p className="text-gray-400 mt-2">Gerencie todos os pedidos da sua loja</p>
        </div>
        <button
          onClick={refreshOrders}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-300"
          title="Atualizar pedidos"
        >
                          <FaRedo size={20} />
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-800 rounded-lg p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pedidos Pendentes</p>
                <p className="text-2xl font-bold text-white">
                  {stats.statusBreakdown.pending || 0}
                </p>
              </div>
              <div className="bg-yellow-500 p-3 rounded-full">
                <FaClock className="text-white" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Em Processamento</p>
                <p className="text-2xl font-bold text-white">
                  {stats.statusBreakdown.processing || 0}
                </p>
              </div>
              <div className="bg-blue-500 p-3 rounded-full">
                <FaClock className="text-white" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Enviados</p>
                <p className="text-2xl font-bold text-white">
                  {stats.statusBreakdown.shipped || 0}
                </p>
              </div>
              <div className="bg-purple-500 p-3 rounded-full">
                <FaTruck className="text-white" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Entregues</p>
                <p className="text-2xl font-bold text-white">
                  {stats.statusBreakdown.delivered || 0}
                </p>
              </div>
              <div className="bg-green-500 p-3 rounded-full">
                <FaCheckCircle className="text-white" size={20} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar pedidos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">Todos os Status</option>
            <option value="pending">Pendente</option>
            <option value="processing">Processando</option>
            <option value="shipped">Enviado</option>
            <option value="delivered">Entregue</option>
            <option value="cancelled">Cancelado</option>
          </select>

          {/* Payment Status Filter */}
          <select
            value={selectedPaymentStatus}
            onChange={(e) => setSelectedPaymentStatus(e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">Todos os Pagamentos</option>
            <option value="pending">Pendente</option>
            <option value="paid">Pago</option>
            <option value="failed">Falhou</option>
          </select>

          {/* Date Filter */}
          <select 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">Todos</option>
            <option value="today">Hoje</option>
            <option value="week">Esta Semana</option>
            <option value="month">Este Mês</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        <div className="mt-4">
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg transition-colors duration-300"
          >
            Limpar Filtros
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Pedido
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Pagamento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Rastreio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {orders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                const paymentInfo = getPaymentStatusInfo(order.payment_status);
                const StatusIcon = statusInfo.icon;
                
                return (
                  <tr key={order.id} className="hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white">{order.order_number}</div>
                        <div className="text-sm text-gray-400">{order.items.length} item(s)</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white">{order.customer_name}</div>
                        <div className="text-sm text-gray-400">{order.customer_email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      R$ {order.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.color}`}>
                        <StatusIcon className="mr-1" size={12} />
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${paymentInfo.color}`}>
                        {paymentInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.tracking_code ? (
                        <div className="text-sm">
                          <div className="text-green-400 font-medium">{order.tracking_code}</div>
                          {order.shipping_company && (
                            <div className="text-gray-400 text-xs">{order.shipping_company}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">Sem rastreio</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link href={`/admin/pedidos/${order.id}`} className="text-blue-400 hover:text-blue-300 transition-colors">
                          <FaEye size={16} />
                        </Link>
                        <Link href={`/admin/pedidos/${order.id}`} className="text-yellow-400 hover:text-yellow-300 transition-colors">
                          <FaEdit size={16} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Loading State */}
        {loading && orders.length > 0 && (
          <div className="flex items-center justify-center py-8">
            <FaSpinner className="animate-spin text-blue-500 mr-2" size={20} />
            <span className="text-gray-400">Carregando...</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && orders.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">
              Nenhum pedido encontrado
            </div>
            <div className="text-gray-500 text-sm">
              Tente ajustar os filtros ou aguarde novos pedidos
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Mostrando {orders.length} de {totalOrders} pedidos
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-3 py-2 rounded-lg transition-colors ${
                        pageNum === page 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button 
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
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
