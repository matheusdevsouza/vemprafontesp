'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  FaBox, 
  FaShoppingCart, 
  FaUsers, 
  FaDollarSign,
  FaExclamationTriangle,
  FaChartLine,
  FaArrowUp,
  FaArrowDown,
  FaRedo,
  FaCheckCircle
} from 'react-icons/fa';

interface DashboardStats {
  products: {
    total: number;
    totalStock: number;
    averagePrice: number;
    lowStockCount: number;
  };
  orders: {
    total: number;
    totalRevenue: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
  };
  users: {
    total: number;
    newThisPeriod: number;
  };
  revenue: {
    current: number;
    previous: number;
    change: number;
    changeType: 'increase' | 'decrease';
  };
  recentActivity: {
    orders: Array<{
      id: number;
      orderNumber: string;
      customerName: string;
      total: number;
      status: string;
      createdAt: string;
    }>;
    products: Array<{
      id: number;
      name: string;
      brand: string;
      price: number;
      createdAt: string;
    }>;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('month');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchDashboardStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/admin/dashboard?period=${period}`);
      const result = await response.json();
      
      if (result.success) {
        setStats(result.data);
        setLastUpdate(new Date());
      } else {
        setError(result.error || 'Erro ao carregar estatísticas');
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const refreshStats = () => {
    fetchDashboardStats();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400';
      case 'processing': return 'text-blue-400';
      case 'shipped': return 'text-purple-400';
      case 'delivered': return 'text-green-400';
      case 'cancelled': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'processing': return 'Processando';
      case 'shipped': return 'Enviado';
      case 'delivered': return 'Entregue';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-700 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
          <FaExclamationTriangle className="mx-auto text-red-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-red-300 mb-2">Erro ao carregar dashboard</h3>
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={refreshStats}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-300"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-gray-400">Nenhum dado disponível</p>
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Total de Produtos',
      value: stats.products.total.toLocaleString('pt-BR'),
      change: stats.products.lowStockCount > 0 ? `${stats.products.lowStockCount} com estoque baixo` : 'Estoque OK',
      trend: stats.products.lowStockCount > 0 ? 'down' : 'up',
      icon: FaBox,
      color: 'from-primary-500 to-primary-600',
      bgColor: 'bg-primary-500/10',
      borderColor: 'border-primary-500/30'
    },
    {
      title: 'Total de Pedidos',
      value: stats.orders.total.toLocaleString('pt-BR'),
      change: `${stats.orders.pending} pendentes`,
      trend: stats.orders.pending > 0 ? 'up' : 'down',
      icon: FaShoppingCart,
      color: 'from-primary-500 to-primary-600',
      bgColor: 'bg-primary-500/10',
      borderColor: 'border-primary-500/30'
    },
    {
      title: 'Total de Usuários',
      value: stats.users.total.toLocaleString('pt-BR'),
      change: `+${stats.users.newThisPeriod} este período`,
      trend: 'up',
      icon: FaUsers,
      color: 'from-primary-500 to-primary-600',
      bgColor: 'bg-primary-500/10',
      borderColor: 'border-primary-500/30'
    },
    {
      title: 'Receita Total',
      value: `R$ ${stats.revenue.current.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      change: `${stats.revenue.change >= 0 ? '+' : ''}${stats.revenue.change.toFixed(1)}%`,
      trend: stats.revenue.changeType,
      icon: FaDollarSign,
      color: 'from-primary-500 to-primary-600',
      bgColor: 'bg-primary-500/10',
      borderColor: 'border-primary-500/30'
    }
  ];

  const alerts = [
    ...(stats.products.lowStockCount > 0 ? [{
      type: 'warning',
      title: 'Produtos com Estoque Baixo',
      message: `${stats.products.lowStockCount} produtos precisam de reposição`,
      description: 'Verifique o estoque para evitar indisponibilidade',
      icon: FaExclamationTriangle,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
      iconBg: 'bg-red-500/20'
    }] : []),
    ...(stats.orders.pending > 0 ? [{
      type: 'info',
      title: 'Pedidos Pendentes',
      message: `${stats.orders.pending} pedidos aguardando processamento`,
      description: 'Atualize o status dos pedidos para manter os clientes informados',
      icon: FaChartLine,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      iconBg: 'bg-primary-500/20'
    }] : [])
  ];



  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
          <p className="text-gray-400 text-sm">Visão geral da sua loja</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="bg-dark-700/50 border border-dark-600/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary-500"
          >
            <option value="today">Hoje</option>
            <option value="week">Esta Semana</option>
            <option value="month">Este Mês</option>
            <option value="year">Este Ano</option>
          </select>
          <button
            onClick={refreshStats}
            className="p-2 text-gray-400 hover:text-white hover:bg-dark-700/50 rounded-lg transition-all duration-300"
            title="Atualizar dados"
          >
                            <FaRedo size={16} />
          </button>
          <div className="text-right">
            <div className="text-xs text-gray-400">Última atualização</div>
            <div className="text-white font-medium text-sm">
              {lastUpdate.toLocaleDateString('pt-BR')}, {lastUpdate.toLocaleTimeString('pt-BR')}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            variants={itemVariants}
            className="group relative bg-dark-800/50 backdrop-blur-sm border border-dark-700/50 rounded-xl p-4 hover:border-dark-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="text-white text-lg" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${stat.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                {stat.trend === 'up' ? <FaArrowUp size={12} /> : <FaArrowDown size={12} />}
                {stat.change}
              </div>
            </div>
            
            <div className="mb-2">
              <div className="text-xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-gray-400">{stat.title}</div>
            </div>

            {/* Gradient border effect */}
            <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 -z-10`}></div>
          </motion.div>
        ))}
      </motion.div>

      {/* Alerts and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Alerts */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={`${stats.products.lowStockCount > 0 ? 'lg:col-span-3' : 'lg:col-span-2'} space-y-3`}
        >
          {alerts.length > 0 ? (
            alerts.map((alert, index) => (
              <motion.div
                key={alert.title}
                variants={itemVariants}
                className={`${alert.bgColor} ${alert.borderColor} border rounded-xl p-4 backdrop-blur-sm`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 ${alert.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <alert.icon className={`${alert.color} text-lg`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`${alert.color} font-semibold text-base mb-1`}>{alert.title}</h3>
                    <p className="text-white font-medium text-sm mb-1">{alert.message}</p>
                    <p className="text-gray-400 text-xs">{alert.description}</p>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              variants={itemVariants}
              className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 backdrop-blur-sm"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FaCheckCircle className="text-green-400 text-lg" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-green-400 font-semibold text-base mb-1">Tudo em ordem!</h3>
                  <p className="text-white font-medium text-sm mb-1">Nenhum alerta crítico no momento</p>
                  <p className="text-gray-400 text-xs">Sua loja está funcionando perfeitamente</p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>


      </div>

      {/* Recent Activity */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-dark-800/50 backdrop-blur-sm border border-dark-700/50 rounded-xl p-4"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-white">Atividade Recente</h3>
          <button className="text-primary-400 hover:text-primary-300 text-xs font-medium transition-colors duration-300">
            Ver todas
          </button>
        </div>
        
        <div className="space-y-3">
          {stats.recentActivity.orders.map((order, index) => (
            <motion.div
              key={`order-${order.id}`}
              variants={itemVariants}
              className="flex items-center gap-3 p-3 bg-dark-700/30 rounded-lg border border-dark-600/30"
            >
              <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor(order.status)}`}></div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-medium text-sm">
                  Pedido {order.orderNumber} - {order.customerName}
                </div>
                <div className="text-gray-400 text-xs">
                  R$ {order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} • {getStatusLabel(order.status)}
                </div>
              </div>
              <div className="text-gray-500 text-xs">
                {new Date(order.createdAt).toLocaleDateString('pt-BR')}
              </div>
            </motion.div>
          ))}
          
          {stats.recentActivity.products.map((product, index) => (
            <motion.div
              key={`product-${product.id}`}
              variants={itemVariants}
              className="flex items-center gap-3 p-3 bg-dark-700/30 rounded-lg border border-dark-600/30"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-medium text-sm">
                  {product.name} - {product.brand}
                </div>
                <div className="text-gray-400 text-xs">
                  R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className="text-gray-500 text-xs">
                {new Date(product.createdAt).toLocaleDateString('pt-BR')}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
