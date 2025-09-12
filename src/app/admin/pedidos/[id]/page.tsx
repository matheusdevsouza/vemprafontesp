"use client"

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { FaSpinner, FaSave, FaArrowLeft, FaCheckCircle } from 'react-icons/fa'

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
  shipping_address?: string
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Cliente</label>
            <input value={order.customer_name || ''} disabled className="w-full bg-dark-900 border border-dark-700 rounded-lg p-2 text-white opacity-70" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input value={order.customer_email || ''} disabled className="w-full bg-dark-900 border border-dark-700 rounded-lg p-2 text-white opacity-70" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Telefone</label>
            <input value={order.customer_phone || ''} disabled className="w-full bg-dark-900 border border-dark-700 rounded-lg p-2 text-white opacity-70" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Método de Pagamento</label>
            <input value={order.payment_method || ''} disabled className="w-full bg-dark-900 border border-dark-700 rounded-lg p-2 text-white opacity-70" />
          </div>
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
        <div>
          <label className="block text-sm text-gray-400 mb-1">Endereço de Entrega</label>
          <textarea
            value={order.shipping_address || ''}
            disabled
            rows={3}
            className="w-full bg-dark-900 border border-dark-700 rounded-lg p-2 text-white opacity-70"
          />
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
    </div>
  )
}
