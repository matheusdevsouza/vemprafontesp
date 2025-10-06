"use client"

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  FaSpinner, 
  FaSave, 
  FaArrowLeft, 
  FaCheckCircle, 
  FaEye, 
  FaEyeSlash, 
  FaLock, 
  FaShieldAlt, 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaIdCard,
  FaTimes,
  FaExclamationTriangle
} from 'react-icons/fa'

interface OrderItem {
  id: number
  product_name: string
  quantity: number
  unit_price: number
}

interface Order {
  id: number
  order_number: string
  customer_name?: string
  customer_email?: string
  customer_phone?: string
  customer_cpf?: string
  shipping_address?: string
  formatted_address?: {
    street: string
    number: string
    complement: string
    neighborhood: string
    city: string
    state: string
    zipcode: string
    shipping_cost: number
  }
  notes?: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  payment_method?: string
  subtotal: number
  shipping_cost: number
  tax_amount: number
  discount_amount: number
  total_amount: number
  currency: string
  items: OrderItem[]
  createdAt: string
  updatedAt: string
  shipped_at?: string
  delivered_at?: string
  tracking_code?: string
  tracking_url?: string
  shipping_company?: string
  shipping_status?: string
  shipping_notes?: string
}

export default function OrderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = Number(params?.id)

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  
  // Estados para revelação controlada de dados sensíveis
  const [revealedData, setRevealedData] = useState<{
    email: boolean;
    phone: boolean;
    cpf: boolean;
    address: boolean;
  }>({
    email: false,
    phone: false,
    cpf: false,
    address: false
  })
  const [showRevealModal, setShowRevealModal] = useState(false)
  const [dataToReveal, setDataToReveal] = useState<'email' | 'phone' | 'cpf' | 'address' | null>(null)
  const [adminPassword, setAdminPassword] = useState('')
  const [revealing, setRevealing] = useState(false)

  useEffect(() => {
    async function fetchOrder() {
      try {
        setLoading(true)
        const res = await fetch(`/api/admin/orders/${id}`)
        if (!res.ok) throw new Error('Falha ao carregar pedido')
        const response = await res.json()
        const data = response.order // Os dados estão em response.order
        
        setOrder(data)
      } catch (e: any) {
        setError(e.message || 'Erro inesperado')
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchOrder()
  }, [id])

  async function handleSave() {
    if (!order) return
    try {
      setSaving(true)
      setError(null)
      
      const requestBody = {
        status: order.status,
        payment_status: order.payment_status,
        tracking_code: order.tracking_code,
        tracking_url: order.tracking_url,
        shipping_company: order.shipping_company,
        shipping_status: order.shipping_status,
        shipping_notes: order.shipping_notes
      };
      
      console.log('📤 Enviando dados para atualização:', requestBody);
      
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })
      
      console.log('📥 Resposta da API:', { status: res.status, ok: res.ok });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('❌ Erro da API:', errorData);
        throw new Error(errorData.error || `Erro ${res.status}: ${res.statusText}`);
      }
      
      const result = await res.json();
      console.log('✅ Resposta de sucesso:', result);
      
      // Verificar se o e-mail foi enviado
      if (result.message && result.message.includes('e-mail')) {
        setSaved(true)
        setTimeout(() => setSaved(false), 5000) // Mostrar por mais tempo se incluir e-mail
      } else {
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
      }
    } catch (e: any) {
      console.error('❌ Erro ao salvar:', e);
      setError(e.message || 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  // Função para revelar dados sensíveis
  async function handleRevealData(dataType: 'email' | 'phone' | 'cpf' | 'address') {
    try {
      setRevealing(true)
      setError(null)
      
      const res = await fetch(`/api/admin/orders/${id}/reveal-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataType,
          password: adminPassword
        })
      })
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao revelar dados');
      }
      
      const result = await res.json()
      
      // Atualizar o pedido com os dados revelados
      if (result.success && result.data) {
        setOrder(prevOrder => {
          if (!prevOrder) return prevOrder;
          
          const updatedOrder = { ...prevOrder };
          
          switch (dataType) {
            case 'email':
              updatedOrder.customer_email = result.data.email;
              break;
            case 'phone':
              updatedOrder.customer_phone = result.data.phone;
              break;
            case 'cpf':
              updatedOrder.customer_cpf = result.data.cpf;
              break;
            case 'address':
              updatedOrder.shipping_address = result.data.shipping_address;
              updatedOrder.formatted_address = result.data.formatted_address;
              break;
          }
          
          return updatedOrder;
        });
        
        // Marcar como revelado
        setRevealedData(prev => ({
          ...prev,
          [dataType]: true
        }));
        
        // Fechar modal
        setShowRevealModal(false)
        setAdminPassword('')
        setDataToReveal(null)
        
        // Log de sucesso
        console.log(`✅ Dados ${dataType} revelados com sucesso`);
      }
    } catch (e: any) {
      console.error('❌ Erro ao revelar dados:', e);
      setError(e.message || 'Erro ao revelar dados')
    } finally {
      setRevealing(false)
    }
  }

  // Função para abrir modal de revelação
  function openRevealModal(dataType: 'email' | 'phone' | 'cpf' | 'address') {
    setDataToReveal(dataType)
    setShowRevealModal(true)
    setAdminPassword('')
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <FaSpinner className="animate-spin text-primary-500" size={24} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-4 rounded-lg">
          {error}
        </div>
      </div>
    )
  }

  if (!order) return null

  return (
    <div className="p-6 space-y-6">
      <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-gray-300 hover:text-white">
        <FaArrowLeft /> Voltar
      </button>

      <div className="bg-dark-800/60 border border-dark-700/60 rounded-xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Pedido {order.order_number}</h2>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg disabled:opacity-60"
          >
            {saving ? <FaSpinner className="animate-spin" /> : <FaSave />} Salvar
          </button>
        </div>

        {saved && (
          <div className="flex items-center gap-2 text-green-400">
            <FaCheckCircle /> 
            {order?.tracking_code ? 'Alterações salvas e e-mail de rastreio enviado!' : 'Alterações salvas com sucesso'}
          </div>
        )}

        {/* Informações do Cliente */}
        <div className="bg-gradient-to-br from-dark-800/80 to-dark-900/80 border border-dark-700/60 rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <FaUser className="text-white" size={18} />
          </div>
          <div>
              <h4 className="text-white font-semibold text-lg">Informações do Cliente</h4>
              <p className="text-gray-400 text-sm">Dados pessoais e de contato</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Nome Completo */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                <FaUser size={12} className="text-blue-400" />
                Nome Completo
              </label>
              <div className="relative">
                <input 
                  value={order.customer_name || ''} 
                  disabled 
                  className="w-full bg-dark-700/50 border border-dark-600/50 rounded-lg px-4 py-3 text-white opacity-80 focus:outline-none focus:border-blue-500/50 transition-colors" 
                />
              </div>
            </div>
            
            {/* Email com botão de revelação */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                <FaEnvelope size={12} className="text-green-400" />
                Email
              </label>
              <div className="relative">
                <input 
                  value={revealedData.email ? (order.customer_email || '') : '••••••••@•••••.com'} 
                  disabled 
                  className={`w-full bg-dark-700/50 border border-dark-600/50 rounded-lg px-4 py-3 text-white transition-all duration-300 ${
                    revealedData.email 
                      ? 'opacity-80 focus:border-green-500/50' 
                      : 'opacity-60 focus:border-gray-500/50'
                  }`}
                />
                {!revealedData.email && (
                  <button
                    onClick={() => openRevealModal('email')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-105 shadow-lg"
                    title="Revelar email completo"
                  >
                    <FaEye size={16} />
                  </button>
                )}
                {revealedData.email && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-green-500/20 text-green-400 rounded-lg flex items-center justify-center">
                    <FaEyeSlash size={16} />
                  </div>
                )}
              </div>
            </div>
            
            {/* Telefone com botão de revelação */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                <FaPhone size={12} className="text-purple-400" />
                Telefone
              </label>
              <div className="relative">
                <input 
                  value={revealedData.phone ? (order.customer_phone || '') : '•• •••••-••••'} 
                  disabled 
                  className={`w-full bg-dark-700/50 border border-dark-600/50 rounded-lg px-4 py-3 text-white transition-all duration-300 ${
                    revealedData.phone 
                      ? 'opacity-80 focus:border-purple-500/50' 
                      : 'opacity-60 focus:border-gray-500/50'
                  }`}
                />
                {!revealedData.phone && (
                  <button
                    onClick={() => openRevealModal('phone')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-105 shadow-lg"
                    title="Revelar telefone completo"
                  >
                    <FaEye size={16} />
                  </button>
                )}
                {revealedData.phone && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-purple-500/20 text-purple-400 rounded-lg flex items-center justify-center">
                    <FaEyeSlash size={16} />
                  </div>
                )}
              </div>
            </div>
            
            {/* CPF com botão de revelação */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                <FaIdCard size={12} className="text-orange-400" />
                CPF
              </label>
              <div className="relative">
                <input 
                  value={revealedData.cpf ? (order.customer_cpf || '') : '•••.•••.•••-••'} 
                  disabled 
                  className={`w-full bg-dark-700/50 border border-dark-600/50 rounded-lg px-4 py-3 text-white transition-all duration-300 ${
                    revealedData.cpf 
                      ? 'opacity-80 focus:border-orange-500/50' 
                      : 'opacity-60 focus:border-gray-500/50'
                  }`}
                />
                {!revealedData.cpf && (
                  <button
                    onClick={() => openRevealModal('cpf')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-105 shadow-lg"
                    title="Revelar CPF completo"
                  >
                    <FaEye size={16} />
                  </button>
                )}
                {revealedData.cpf && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-orange-500/20 text-orange-400 rounded-lg flex items-center justify-center">
                    <FaEyeSlash size={16} />
                  </div>
                )}
              </div>
            </div>
            
            {/* Método de Pagamento */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                <FaShieldAlt size={12} className="text-emerald-400" />
                Método de Pagamento
              </label>
              <div className="relative">
                <input 
                  value={order.payment_method || ''} 
                  disabled 
                  className="w-full bg-dark-700/50 border border-dark-600/50 rounded-lg px-4 py-3 text-white opacity-80 focus:outline-none focus:border-emerald-500/50 transition-colors" 
                />
              </div>
            </div>
          </div>
          </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Status do Pedido</label>
            <select
              value={order.status}
              onChange={(e) => setOrder({ ...order, status: e.target.value as Order['status'] })}
              className="w-full bg-dark-900 border border-dark-700 rounded-lg p-2 text-white"
            >
              <option value="pending">Pendente</option>
              <option value="processing">Processando</option>
              <option value="shipped">Enviado</option>
              <option value="delivered">Entregue</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Status do Pagamento</label>
            <select
              value={order.payment_status}
              onChange={(e) => setOrder({ ...order, payment_status: e.target.value as Order['payment_status'] })}
              className="w-full bg-dark-900 border border-dark-700 rounded-lg p-2 text-white"
            >
              <option value="pending">Pendente</option>
              <option value="paid">Pago</option>
              <option value="failed">Falhou</option>
              <option value="refunded">Reembolsado</option>
            </select>
          </div>
        </div>

        {/* Endereço de Entrega */}
        <div className="bg-dark-900/60 border border-dark-700/60 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-white font-semibold">Endereço de Entrega</h4>
            {!revealedData.address && (
              <button
                onClick={() => openRevealModal('address')}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-medium rounded-lg transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
              >
                <FaEye size={16} />
                Revelar Endereço
              </button>
            )}
          </div>
          {revealedData.address && order.formatted_address ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Rua</label>
                <input value={order.formatted_address.street} disabled className="w-full bg-dark-800 border border-dark-600 rounded-lg p-2 text-white opacity-70" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Número</label>
                <input value={order.formatted_address.number} disabled className="w-full bg-dark-800 border border-dark-600 rounded-lg p-2 text-white opacity-70" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Complemento</label>
                <input value={order.formatted_address.complement || 'N/A'} disabled className="w-full bg-dark-800 border border-dark-600 rounded-lg p-2 text-white opacity-70" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Bairro</label>
                <input value={order.formatted_address.neighborhood} disabled className="w-full bg-dark-800 border border-dark-600 rounded-lg p-2 text-white opacity-70" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Cidade</label>
                <input value={order.formatted_address.city} disabled className="w-full bg-dark-800 border border-dark-600 rounded-lg p-2 text-white opacity-70" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Estado</label>
                <input value={order.formatted_address.state} disabled className="w-full bg-dark-800 border border-dark-600 rounded-lg p-2 text-white opacity-70" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">CEP</label>
                <input value={order.formatted_address.zipcode} disabled className="w-full bg-dark-800 border border-dark-600 rounded-lg p-2 text-white opacity-70" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Custo do Frete</label>
                <input value={`R$ ${order.formatted_address.shipping_cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} disabled className="w-full bg-dark-800 border border-dark-600 rounded-lg p-2 text-white opacity-70" />
              </div>
            </div>
          ) : revealedData.address ? (
            <div>
              <label className="block text-sm text-gray-400 mb-1">Endereço Completo</label>
              <textarea
                value={order.shipping_address || ''}
                disabled
                rows={3}
                className="w-full bg-dark-800 border border-dark-600 rounded-lg p-2 text-white opacity-70"
              />
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="bg-dark-800/50 border border-dark-600/50 rounded-lg p-6">
                <FaEyeSlash className="mx-auto text-gray-500 mb-3" size={24} />
                <p className="text-gray-400 text-sm">Endereço protegido</p>
                <p className="text-gray-500 text-xs mt-1">Clique em "Revelar Endereço" para visualizar</p>
              </div>
            </div>
          )}
        </div>

        {/* Rastreamento e Envio */}
        <div className="bg-dark-900/60 border border-dark-700/60 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-3">Rastreamento e Envio</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Código de Rastreamento</label>
              <input
                value={order.tracking_code || ''}
                onChange={(e) => setOrder({ ...order, tracking_code: e.target.value })}
                placeholder="Ex: AA123456789BR"
                className="w-full bg-dark-900 border border-dark-700 rounded-lg p-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">URL de Rastreamento</label>
              <input
                value={order.tracking_url || ''}
                onChange={(e) => setOrder({ ...order, tracking_url: e.target.value })}
                placeholder="https://..."
                className="w-full bg-dark-900 border border-dark-700 rounded-lg p-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Transportadora</label>
              <input
                value={order.shipping_company || ''}
                onChange={(e) => setOrder({ ...order, shipping_company: e.target.value })}
                placeholder="Ex: Correios, Jadlog, Loggi"
                className="w-full bg-dark-900 border border-dark-700 rounded-lg p-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Status de Envio</label>
              <input
                value={order.shipping_status || ''}
                onChange={(e) => setOrder({ ...order, shipping_status: e.target.value })}
                placeholder="Ex: Postado, Em trânsito, Aguardando retirada"
                className="w-full bg-dark-900 border border-dark-700 rounded-lg p-2 text-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Observações de Envio</label>
              <textarea
                value={order.shipping_notes || ''}
                onChange={(e) => setOrder({ ...order, shipping_notes: e.target.value })}
                rows={3}
                placeholder="Observações sobre o envio, instruções especiais, etc."
                className="w-full bg-dark-900 border border-dark-700 rounded-lg p-2 text-white"
              />
            </div>
          </div>
        </div>

        {/* Notas */}
        {order.notes && (
          <div>
            <label className="block text-sm text-gray-400 mb-1">Observações</label>
            <textarea
              value={order.notes}
              disabled
              rows={2}
              className="w-full bg-dark-900 border border-dark-700 rounded-lg p-2 text-white opacity-70"
            />
          </div>
        )}

        {/* Detalhes Financeiros */}
        <div className="bg-dark-900/60 border border-dark-700/60 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-3">Detalhes Financeiros</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Subtotal:</span>
              <div className="text-white font-medium">R$ {order.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </div>
            <div>
              <span className="text-gray-400">Frete:</span>
              <div className="text-white font-medium">R$ {order.shipping_cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </div>
            <div>
              <span className="text-gray-400">Impostos:</span>
              <div className="text-white font-medium">R$ {order.tax_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </div>
            <div>
              <span className="text-gray-400">Desconto:</span>
              <div className="text-white font-medium">R$ {order.discount_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-dark-700">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 font-medium">Total:</span>
              <span className="text-white text-lg font-bold">R$ {order.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Datas Importantes */}
        <div className="bg-dark-900/60 border border-dark-700/60 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-3">Datas Importantes</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Criado em:</span>
              <div className="text-white font-medium">
                {new Date(order.createdAt).toLocaleDateString('pt-BR')}
              </div>
            </div>
            <div>
              <span className="text-gray-400">Atualizado em:</span>
              <div className="text-white font-medium">
                {new Date(order.updatedAt).toLocaleDateString('pt-BR')}
              </div>
            </div>
            {order.shipped_at && (
              <div>
                <span className="text-gray-400">Enviado em:</span>
                <div className="text-white font-medium">
                  {new Date(order.shipped_at).toLocaleDateString('pt-BR')}
                </div>
              </div>
            )}
            {order.delivered_at && (
              <div>
                <span className="text-gray-400">Entregue em:</span>
                <div className="text-white font-medium">
                  {new Date(order.delivered_at).toLocaleDateString('pt-BR')}
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-2">Itens</h3>
          <div className="bg-dark-900/60 border border-dark-700/60 rounded-lg">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-gray-400 text-sm">Produto</th>
                  <th className="px-4 py-2 text-left text-gray-400 text-sm">Qtd</th>
                  <th className="px-4 py-2 text-left text-gray-400 text-sm">Preço</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id} className="border-t border-dark-800">
                    <td className="px-4 py-2 text-gray-200">{item.product_name}</td>
                    <td className="px-4 py-2 text-gray-200">{item.quantity}</td>
                    <td className="px-4 py-2 text-gray-200">R$ {item.unit_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de Confirmação para Revelar Dados Sensíveis */}
      {showRevealModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-dark-800/95 to-dark-900/95 border border-dark-700/50 rounded-2xl p-8 w-full max-w-lg shadow-2xl">
            {/* Header do Modal */}
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl flex items-center justify-center border border-amber-500/30">
                <FaLock className="text-amber-400" size={20} />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-xl mb-1">Revelação de Dados Sensíveis</h3>
                <p className="text-gray-400 text-sm">
                  {dataToReveal === 'email' && 'Solicitação para revelar email do cliente'}
                  {dataToReveal === 'phone' && 'Solicitação para revelar telefone do cliente'}
                  {dataToReveal === 'cpf' && 'Solicitação para revelar CPF do cliente'}
                  {dataToReveal === 'address' && 'Solicitação para revelar endereço de entrega do cliente'}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowRevealModal(false)
                  setAdminPassword('')
                  setDataToReveal(null)
                }}
                className="w-8 h-8 bg-dark-700/50 hover:bg-dark-600/50 text-gray-400 hover:text-white rounded-lg flex items-center justify-center transition-all duration-300"
                disabled={revealing}
              >
                <FaTimes size={14} />
              </button>
            </div>
            
            {/* Aviso de Segurança */}
            <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FaExclamationTriangle className="text-amber-400" size={14} />
                </div>
                <div>
                  <h4 className="text-amber-400 font-semibold text-sm mb-1">Aviso de Segurança</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Esta ação será registrada nos logs de auditoria com timestamp e hash único. 
                    Apenas administradores autenticados podem revelar dados sensíveis.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Campo de Senha */}
            <div className="space-y-3 mb-6">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                <FaShieldAlt size={12} className="text-blue-400" />
                Senha de Administrador
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Digite sua senha de administrador..."
                  className="w-full bg-dark-700/50 border border-dark-600/50 rounded-xl px-4 py-4 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 focus:bg-dark-700 transition-all duration-300 text-sm"
                  autoFocus
                  disabled={revealing}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <FaLock className="text-gray-500" size={14} />
                </div>
              </div>
            </div>
            
            {/* Botões de Ação */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRevealModal(false)
                  setAdminPassword('')
                  setDataToReveal(null)
                }}
                className="flex-1 px-6 py-3 bg-dark-700/50 hover:bg-dark-600/50 border border-dark-600/50 hover:border-dark-500/50 text-gray-300 hover:text-white rounded-xl transition-all duration-300 font-medium text-sm"
                disabled={revealing}
              >
                Cancelar
              </button>
              <button
                onClick={() => dataToReveal && handleRevealData(dataToReveal)}
                disabled={!adminPassword || revealing}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-xl transition-all duration-300 font-medium text-sm flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {revealing ? (
                  <>
                    <FaSpinner className="animate-spin" size={14} />
                    Verificando...
                  </>
                ) : (
                  <>
                    <FaEye size={14} />
                    Revelar Dados
                  </>
                )}
              </button>
            </div>
            
            {/* Rodapé do Modal */}
            <div className="mt-6 pt-4 border-t border-dark-700/50">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <FaShieldAlt size={10} />
                <span>Esta ação é auditada e monitorada por segurança</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
