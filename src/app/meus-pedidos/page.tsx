'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck, 
  CreditCard,
  Calendar,
  MapPin,
  Phone,
  EnvelopeSimple,
  Receipt,
  CaretDown,
  Funnel,
  MagnifyingGlass,
  X
} from 'phosphor-react';

interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  slug: string;
  product_image: string;
  size: string;
  color: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Order {
  id: number;
  order_number: string;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: string;
  subtotal: number;
  shipping_cost: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  notes: string;
  shipped_at: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
  tracking_code?: string;
  tracking_url?: string;
  shipping_company?: string;
  shipping_status?: string;
  shipping_notes?: string;
  items: OrderItem[];
}

const statusConfig = {
  pending: { label: 'Pendente', color: 'text-yellow-500', bg: 'bg-yellow-500/10', icon: Clock },
  paid: { label: 'Pago', color: 'text-green-500', bg: 'bg-green-500/10', icon: CheckCircle },
  processing: { label: 'Processando', color: 'text-blue-500', bg: 'bg-blue-500/10', icon: Package },
  shipped: { label: 'Enviado', color: 'text-purple-500', bg: 'bg-purple-500/10', icon: Truck },
  delivered: { label: 'Entregue', color: 'text-green-600', bg: 'bg-green-600/10', icon: CheckCircle },
  cancelled: { label: 'Cancelado', color: 'text-red-500', bg: 'bg-red-500/10', icon: XCircle },
  refunded: { label: 'Reembolsado', color: 'text-gray-500', bg: 'bg-gray-500/10', icon: XCircle }
};

const paymentStatusConfig = {
  pending: { label: 'Pendente', color: 'text-yellow-500' },
  paid: { label: 'Pago', color: 'text-green-500' },
  failed: { label: 'Falhou', color: 'text-red-500' },
  refunded: { label: 'Reembolsado', color: 'text-gray-500' }
};

export default function MeusPedidosPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState('');
  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());
  
  // Estados dos filtros
  const [filters, setFilters] = useState({
    status: 'all',
    period: 'all',
    search: '',
    showFilters: false
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchOrders();
    }
  }, [user, loading, router]);

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const response = await fetch('/api/orders/my-orders');
      
      if (!response.ok) {
        throw new Error('Erro ao carregar pedidos');
      }

      const data = await response.json();
      setOrders(data.orders || []);
    } catch (err) {
      setError('Erro ao carregar seus pedidos. Tente novamente.');
      console.error('Erro ao buscar pedidos:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const getStatusConfig = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  };

  const getPaymentStatusConfig = (status: string) => {
    return paymentStatusConfig[status as keyof typeof paymentStatusConfig] || paymentStatusConfig.pending;
  };

  const toggleOrderExpansion = (orderId: number) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const isOrderExpanded = (orderId: number) => {
    return expandedOrders.has(orderId);
  };

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...orders];

    // Filtro por status
    if (filters.status !== 'all') {
      filtered = filtered.filter(order => order.status === filters.status);
    }

    // Filtro por período
    if (filters.period !== 'all') {
      const now = new Date();
      const orderDate = new Date();
      
      switch (filters.period) {
        case 'last7days':
          filtered = filtered.filter(order => {
            orderDate.setTime(new Date(order.created_at).getTime());
            const diffTime = Math.abs(now.getTime() - orderDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays <= 7;
          });
          break;
        case 'last30days':
          filtered = filtered.filter(order => {
            orderDate.setTime(new Date(order.created_at).getTime());
            const diffTime = Math.abs(now.getTime() - orderDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays <= 30;
          });
          break;
        case 'last3months':
          filtered = filtered.filter(order => {
            orderDate.setTime(new Date(order.created_at).getTime());
            const diffTime = Math.abs(now.getTime() - orderDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays <= 90;
          });
          break;
        case 'thisYear':
          filtered = filtered.filter(order => {
            orderDate.setTime(new Date(order.created_at).getTime());
            return orderDate.getFullYear() === now.getFullYear();
          });
          break;
      }
    }

    // Filtro por busca
    if (filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(order => 
        order.order_number.toLowerCase().includes(searchTerm) ||
        order.items?.some(item => 
          item.product_name.toLowerCase().includes(searchTerm)
        ) ||
        order.customer_name.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredOrders(filtered);
  }, [orders, filters]);

  const clearFilters = () => {
    setFilters({
      status: 'all',
      period: 'all',
      search: '',
      showFilters: false
    });
  };

  const getFilteredCount = () => {
    return filteredOrders.length;
  };

  const getTotalCount = () => {
    return orders.length;
  };

  const getPaymentMethodLabel = (method?: string) => {
    if (!method) return 'Não informado';
    const map: Record<string, string> = {
      credit_card: 'Cartão de crédito',
      debit_card: 'Cartão de débito',
      pix: 'PIX',
      boleto: 'Boleto',
      cash: 'Dinheiro',
      bank_transfer: 'Transferência bancária',
      paypal: 'PayPal',
      mercado_pago: 'Mercado Pago',
    };
    return map[method] || method;
  };

  const formatAddress = (raw?: string) => {
    if (!raw) return 'Endereço não informado';
    try {
      const parsed = JSON.parse(raw);
      const parts: string[] = [];
      if (parsed.street) parts.push(parsed.street);
      if (parsed.number) parts.push(parsed.number);
      if (parsed.complement) parts.push(parsed.complement);
      const streetLine = parts.filter(Boolean).join(', ');
      const cityLine = [parsed.neighborhood, parsed.city, parsed.state]
        .filter(Boolean)
        .join(' - ');
      const zipLine = parsed.zipcode || parsed.zip_code || parsed.cep;
      return [streetLine, cityLine, zipLine ? `CEP: ${zipLine}` : '']
        .filter(Boolean)
        .join(' • ');
    } catch (e) {
      return raw;
    }
  };

  const getTrackingLink = (code?: string, url?: string) => {
    if (!code && !url) return null;
    if (url) return url;
    if (code) return `https://www.17track.net/pt#nums=${encodeURIComponent(code)}`;
    return null;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 pt-20 pb-10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-dark-800 rounded-lg mb-8 w-64"></div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-dark-900 rounded-xl p-6">
                    <div className="h-6 bg-dark-800 rounded mb-4 w-48"></div>
                    <div className="space-y-3">
                      <div className="h-4 bg-dark-800 rounded w-32"></div>
                      <div className="h-4 bg-dark-800 rounded w-24"></div>
                      <div className="h-4 bg-dark-800 rounded w-40"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-dark-950 pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
                  <Receipt className="text-primary-400" size={32} />
                  Meus Pedidos
                </h1>
                <p className="text-gray-400">
                  Acompanhe todos os seus pedidos e seu histórico de compras
                </p>
              </div>
              
              {/* Contador de resultados */}
              <div className="text-right">
                <p className="text-sm text-gray-400">
                  Mostrando <span className="text-white font-semibold">{getFilteredCount()}</span> de <span className="text-white font-semibold">{getTotalCount()}</span> pedidos
                </p>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="mb-6">
            {/* Indicador de filtros ativos */}
            {(filters.status !== 'all' || filters.period !== 'all' || filters.search) && (
              <div className="mb-4 p-3 bg-primary-500/10 border border-primary-500/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Funnel size={16} className="text-primary-400" />
                    <span className="text-sm text-primary-400 font-medium">Filtros ativos:</span>
                  </div>
                  <button
                    onClick={clearFilters}
                    className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
                  >
                    Limpar todos
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {filters.status !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-500/20 text-primary-300 text-xs rounded">
                      Status: {statusConfig[filters.status as keyof typeof statusConfig]?.label || filters.status}
                      <button
                        onClick={() => setFilters(prev => ({ ...prev, status: 'all' }))}
                        className="hover:text-white"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  )}
                  {filters.period !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-500/20 text-primary-300 text-xs rounded">
                      Período: {
                        filters.period === 'last7days' ? 'Últimos 7 dias' :
                        filters.period === 'last30days' ? 'Últimos 30 dias' :
                        filters.period === 'last3months' ? 'Últimos 3 meses' :
                        filters.period === 'thisYear' ? 'Este ano' : filters.period
                      }
                      <button
                        onClick={() => setFilters(prev => ({ ...prev, period: 'all' }))}
                        className="hover:text-white"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  )}
                  {filters.search && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-500/20 text-primary-300 text-xs rounded">
                      Busca: &quot;{filters.search}&quot;
                      <button
                        onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                        className="hover:text-white"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Barra de busca */}
            <div className="relative mb-4">
              <MagnifyingGlass 
                size={20} 
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Buscar por número do pedido, produto ou nome..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full bg-dark-800/50 border border-dark-700 rounded-lg px-12 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:bg-dark-800 transition-all duration-300"
              />
              {filters.search && (
                <button
                  onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Botão para mostrar/ocultar filtros avançados */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setFilters(prev => ({ ...prev, showFilters: !prev.showFilters }))}
                className="flex items-center gap-2 px-4 py-2 bg-dark-800 hover:bg-dark-700 text-white rounded-lg transition-colors"
              >
                <Funnel size={18} />
                Filtros Avançados
              </button>
              
              {(filters.status !== 'all' || filters.period !== 'all' || filters.search) && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                >
                  <X size={16} />
                  Limpar Filtros
                </button>
              )}
            </div>

            {/* Filtros avançados */}
            {filters.showFilters && (
              <div className="bg-dark-800/50 rounded-lg p-4 border border-dark-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Filtro por status */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Status do Pedido
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full bg-dark-900 border border-dark-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500"
                    >
                      <option value="all">Todos os status</option>
                      <option value="pending">Pendente</option>
                      <option value="paid">Pago</option>
                      <option value="processing">Processando</option>
                      <option value="shipped">Enviado</option>
                      <option value="delivered">Entregue</option>
                      <option value="cancelled">Cancelado</option>
                      <option value="refunded">Reembolsado</option>
                    </select>
                  </div>

                  {/* Filtro por período */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Período
                    </label>
                    <select
                      value={filters.period}
                      onChange={(e) => setFilters(prev => ({ ...prev, period: e.target.value }))}
                      className="w-full bg-dark-900 border border-dark-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500"
                    >
                      <option value="all">Todos os períodos</option>
                      <option value="last7days">Últimos 7 dias</option>
                      <option value="last30days">Últimos 30 dias</option>
                      <option value="last3months">Últimos 3 meses</option>
                      <option value="thisYear">Este ano</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Loading State */}
          {loadingOrders && (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-dark-900 rounded-xl p-6 animate-pulse">
                  <div className="h-6 bg-dark-800 rounded mb-4 w-48"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-dark-800 rounded w-32"></div>
                    <div className="h-4 bg-dark-800 rounded w-24"></div>
                    <div className="h-4 bg-dark-800 rounded w-40"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
              <XCircle className="text-red-500 mx-auto mb-3" size={32} />
              <p className="text-red-400">{error}</p>
              <button 
                onClick={fetchOrders}
                className="mt-3 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                Tentar Novamente
              </button>
            </div>
          )}

          {/* Orders List */}
          {!loadingOrders && !error && (
            <>
              {filteredOrders.length === 0 ? (
                <div className="bg-dark-900 rounded-xl p-8 text-center">
                  {orders.length === 0 ? (
                    <>
                      <Package className="text-gray-500 mx-auto mb-4" size={48} />
                      <h3 className="text-xl font-semibold text-white mb-2">
                        Nenhum pedido encontrado
                      </h3>
                      <p className="text-gray-400 mb-6">
                        Você ainda não fez nenhum pedido. Que tal começar a comprar?
                      </p>
                      <a 
                        href="/produtos"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                      >
                        Ver Produtos
                      </a>
                    </>
                  ) : (
                    <>
                      <MagnifyingGlass className="text-gray-500 mx-auto mb-4" size={48} />
                      <h3 className="text-xl font-semibold text-white mb-2">
                        Nenhum pedido encontrado
                      </h3>
                      <p className="text-gray-400 mb-6">
                        Nenhum pedido corresponde aos filtros aplicados. Tente ajustar os critérios de busca.
                      </p>
                      <button 
                        onClick={clearFilters}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                      >
                        Limpar Filtros
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <motion.div 
                  className="space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {filteredOrders.map((order, index) => {
                    const status = getStatusConfig(order.status);
                    const paymentStatus = getPaymentStatusConfig(order.payment_status);
                    const StatusIcon = status.icon;
                    const isExpanded = isOrderExpanded(order.id);

                    return (
                      <motion.div 
                        key={order.id} 
                        className="bg-dark-900 rounded-xl border border-dark-800 overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ 
                          duration: 0.4, 
                          delay: index * 0.1,
                          ease: "easeOut"
                        }}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        {/* Order Header - Barra principal */}
                        <div 
                          className="p-4 sm:p-6 cursor-pointer hover:bg-dark-800/50 transition-colors"
                          onClick={() => toggleOrderExpansion(order.id)}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                              {/* Imagem do primeiro produto */}
                              {order.items && order.items.length > 0 && (
                                <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-dark-800 flex-shrink-0">
                                  <Image 
                                    src={order.items[0].product_image} 
                                    alt={order.items[0].product_name}
                                    width={64}
                                    height={64}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = '/images/Logo.png';
                                    }}
                                  />
                                  {order.items.length > 1 && (
                                    <div className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center font-semibold">
                                      +{order.items.length - 1}
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                                  <div className={`p-1.5 sm:p-2 rounded-lg ${status.bg} flex-shrink-0`}>
                                    <StatusIcon className={`${status.color} sm:w-[18px] sm:h-[18px]`} size={16} />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <h3 className="text-base sm:text-lg font-semibold text-white truncate">
                                      Pedido #{order.order_number}
                                    </h3>
                                    <p className={`text-xs sm:text-sm font-medium ${status.color}`}>
                                      {status.label}
                                    </p>
                                  </div>
                                </div>
                                
                                {/* Nome dos produtos */}
                                <div className="text-xs sm:text-sm text-gray-400">
                                  {order.items && order.items.length > 0 ? (
                                    <div>
                                      <p className="text-white font-medium truncate">
                                        {order.items[0].product_name}
                                      </p>
                                      {order.items.length > 1 && (
                                        <p className="text-gray-500 text-xs">
                                          +{order.items.length - 1} produto{order.items.length > 2 ? 's' : ''} mais
                                        </p>
                                      )}
                                    </div>
                                  ) : (
                                    <p className="text-gray-500">Produtos não disponíveis</p>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                              <div className="text-right">
                                <p className="text-lg sm:text-xl font-bold text-white">
                                  {formatCurrency(order.total_amount)}
                                </p>
                                <p className="text-xs sm:text-sm text-gray-400 whitespace-nowrap">
                                  {formatDate(order.created_at)}
                                </p>
                              </div>
                              
                              {/* Botão expandir */}
                              <motion.div 
                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="flex-shrink-0"
                              >
                                <CaretDown size={18} className="text-gray-400 sm:w-5 sm:h-5" />
                              </motion.div>
                            </div>
                          </div>
                        </div>

                        {/* Conteúdo expandido */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ 
                                duration: 0.4, 
                                ease: "easeInOut",
                                opacity: { duration: 0.3 }
                              }}
                              className="border-t border-dark-800 bg-dark-800/30 overflow-hidden"
                            >
                              <div className="p-6 space-y-6">
                                {/* Lista de produtos */}
                                <div>
                                  <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                                    <Package size={16} />
                                    Produtos do Pedido
                                  </h4>
                                  <div className="space-y-3">
                                    {order.items && order.items.map((item) => (
                                      <div key={item.id} className="flex items-center gap-3 p-3 bg-dark-900 rounded-lg">
                                        <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden bg-dark-800 flex-shrink-0">
                                          <Image 
                                            src={item.product_image} 
                                            alt={item.product_name}
                                            width={48}
                                            height={48}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                              (e.target as HTMLImageElement).src = '/images/Logo.png';
                                            }}
                                          />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <h5 className="text-white font-medium truncate text-sm sm:text-base">{item.product_name}</h5>
                                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-gray-400 mt-1">
                                            <span>Tamanho: {item.size}</span>
                                            <span>Cor: {item.color}</span>
                                            <span>Qtd: {item.quantity}</span>
                                          </div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                          <p className="text-white font-semibold text-sm sm:text-base">{formatCurrency(item.unit_price)}</p>
                                          <p className="text-xs sm:text-sm text-gray-400">cada</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Order Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                      <CreditCard size={16} />
                                      <span>Pagamento:</span>
                                      <span className={`font-medium ${paymentStatus.color}`}>
                                        {paymentStatus.label}
                                      </span>
                                    </div>
                                    {order.payment_method && (
                                      <div className="flex items-center gap-2 text-sm text-gray-400">
                                        <span>Método:</span>
                                        <span className="text-white">{getPaymentMethodLabel(order.payment_method)}</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="space-y-2">
                                    {order.shipped_at && (
                                      <div className="flex items-center gap-2 text-sm text-gray-400">
                                        <Truck size={16} />
                                        <span>Enviado em:</span>
                                        <span className="text-white">{formatDate(order.shipped_at)}</span>
                                      </div>
                                    )}
                                    {order.delivered_at && (
                                      <div className="flex items-center gap-2 text-sm text-gray-400">
                                        <CheckCircle size={16} />
                                        <span>Entregue em:</span>
                                        <span className="text-white">{formatDate(order.delivered_at)}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Rastreamento - Container */}
                                {(order.tracking_code || order.tracking_url) && (
                                  <div className="bg-dark-900 rounded-lg p-3 sm:p-4 border border-dark-800">
                                    <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                                      <div className="text-xs sm:text-sm text-gray-300 flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                          <Truck size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
                                          <span className="font-medium text-white">Rastreamento</span>
                                        </div>
                                        {order.tracking_code && (
                                          <div className="mb-1">
                                            <span className="text-gray-400">Código:</span>
                                            <span className="text-white ml-1 break-all">{order.tracking_code}</span>
                                          </div>
                                        )}
                                        {order.shipping_company && (
                                          <div className="mb-1 text-gray-400">
                                            <span className="text-gray-400">Transportadora:</span>
                                            <span className="text-white ml-1 truncate block">{order.shipping_company}</span>
                                          </div>
                                        )}
                                        {order.shipping_status && (
                                          <div className="mb-1 text-gray-400">
                                            <span className="text-gray-400">Status do envio:</span>
                                            <span className="text-white ml-1 truncate block">{order.shipping_status}</span>
                                          </div>
                                        )}
                                        {order.shipping_notes && (
                                          <div className="mb-1 text-gray-400">
                                            <span className="text-gray-400">Observações:</span>
                                            <span className="text-white ml-1 break-words block">{order.shipping_notes}</span>
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex flex-row sm:flex-col gap-2 flex-shrink-0">
                                        {order.tracking_code && (
                                          <button
                                            onClick={() => copyToClipboard(order.tracking_code!)}
                                            className="flex-1 sm:flex-none px-3 py-2 sm:py-1 text-xs bg-dark-800 hover:bg-dark-700 text-gray-200 rounded border border-dark-700 transition-colors duration-200 font-medium"
                                          >
                                            Copiar código
                                          </button>
                                        )}
                                        {getTrackingLink(order.tracking_code, order.tracking_url) && (
                                          <a
                                            href={getTrackingLink(order.tracking_code, order.tracking_url) as string}
                                            target="_blank"
                                            className="flex-1 sm:flex-none px-3 py-2 sm:py-1 text-xs bg-primary-600 hover:bg-primary-500 text-white rounded transition-colors duration-200 font-medium text-center"
                                          >
                                            Acompanhar envio
                                          </a>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Customer Info */}
                                <div className="bg-dark-800 rounded-lg p-4">
                                  <h4 className="text-sm font-semibold text-white mb-3">Informações do Cliente</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm">
                                    <div className="flex items-center gap-2 text-gray-400">
                                      <span className="w-16 sm:w-20 flex-shrink-0">Nome:</span>
                                      <span className="text-white truncate">{order.customer_name}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-400">
                                      <EnvelopeSimple size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
                                      <span className="text-white truncate">{order.customer_email}</span>
                                    </div>
                                    {order.customer_phone && (
                                      <div className="flex items-center gap-2 text-gray-400">
                                        <Phone size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
                                        <span className="text-white truncate">{order.customer_phone}</span>
                                      </div>
                                    )}
                                    {order.shipping_address && (
                                      <div className="flex items-start gap-2 text-gray-400 md:col-span-2">
                                        <MapPin size={14} className="mt-0.5 flex-shrink-0 sm:w-4 sm:h-4" />
                                        <span className="text-white text-xs sm:text-sm">{formatAddress(order.shipping_address)}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Order Summary */}
                                <div className="bg-dark-800 rounded-lg p-4">
                                  <h4 className="text-sm font-semibold text-white mb-3">Resumo do Pedido</h4>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between text-gray-400">
                                      <span>Subtotal:</span>
                                      <span className="text-white">{formatCurrency(order.subtotal)}</span>
                                    </div>
                                    {order.shipping_cost > 0 && (
                                      <div className="flex justify-between text-gray-400">
                                        <span>Frete:</span>
                                        <span className="text-white">{formatCurrency(order.shipping_cost)}</span>
                                      </div>
                                    )}
                                    {order.tax_amount > 0 && (
                                      <div className="flex justify-between text-gray-400">
                                        <span>Impostos:</span>
                                        <span className="text-white">{formatCurrency(order.tax_amount)}</span>
                                      </div>
                                    )}
                                    {order.discount_amount > 0 && (
                                      <div className="flex justify-between text-green-400">
                                        <span>Desconto:</span>
                                        <span>-{formatCurrency(order.discount_amount)}</span>
                                      </div>
                                    )}
                                    <div className="flex justify-between text-lg font-semibold text-white pt-2 border-t border-dark-700">
                                      <span>Total:</span>
                                      <span>{formatCurrency(order.total_amount)}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Notes */}
                                {order.notes && (
                                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                    <p className="text-sm text-blue-400">
                                      <strong>Observações:</strong> {order.notes}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
} 