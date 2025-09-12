"use client"

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { FaSpinner, FaSave, FaArrowLeft, FaCheckCircle, FaExclamationTriangle, FaUser, FaEnvelope, FaPhone, FaIdCard, FaCalendar, FaVenusMars, FaShieldAlt, FaToggleOn, FaToggleOff, FaShoppingBag, FaMapMarkerAlt } from 'react-icons/fa'

interface UserAddress {
  id: number
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  zip_code: string
  is_default: boolean
}

interface UserOrder {
  id: number
  order_number: string
  total_amount: number
  status: string
  createdAt: string
}

interface User {
  id: number
  name: string
  email: string
  phone: string
  cpf: string
  birth_date?: string
  gender?: string
  is_admin: boolean
  is_active: boolean
  email_verified: boolean
  last_login?: string
  createdAt: string
  updatedAt: string
  stats: {
    total_orders: number
    total_addresses: number
  }
  recent_orders: UserOrder[]
  addresses: UserAddress[]
}

export default function UserDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = Number(params?.id)

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    async function fetchUser() {
      try {
        setLoading(true)
        const res = await fetch(`/api/admin/users/${id}`)
        if (!res.ok) throw new Error('Falha ao carregar usuário')
        const response = await res.json()
        const data = response.data
        
        setUser(data)
      } catch (e: any) {
        setError(e.message || 'Erro inesperado')
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchUser()
  }, [id])

  async function handleSave() {
    if (!user) return
    try {
      setSaving(true)
      setError(null)
      
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          phone: user.phone,
          cpf: user.cpf,
          birth_date: user.birth_date,
          gender: user.gender,
          is_admin: user.is_admin,
          is_active: user.is_active
        })
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Falha ao salvar alterações')
      }
      
      setSaved(true)
      setIsEditing(false)
      setTimeout(() => setSaved(false), 3000)
    } catch (e: any) {
      setError(e.message || 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!user) return
    
    if (!confirm(`Tem certeza que deseja excluir o usuário "${user.name}"? Esta ação não pode ser desfeita.`)) {
      return
    }

    try {
      setSaving(true)
      setError(null)
      
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE'
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Falha ao excluir usuário')
      }
      
      router.push('/admin/usuarios')
    } catch (e: any) {
      setError(e.message || 'Erro ao excluir usuário')
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
          <div className="flex items-center gap-2 mb-2">
            <FaExclamationTriangle />
            <span className="font-semibold">Erro ao carregar usuário</span>
          </div>
          <p>{error}</p>
          <button
            onClick={() => router.back()}
            className="mt-3 text-sm text-red-400 hover:text-red-300 underline"
          >
            Voltar
          </button>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => router.back()} 
          className="inline-flex items-center gap-2 text-gray-300 hover:text-white"
        >
          <FaArrowLeft /> Voltar
        </button>
        
        <div className="flex items-center gap-3">
          {!isEditing && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg"
              >
                <FaUser /> Editar
              </button>
              <button
                onClick={handleDelete}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg disabled:opacity-60"
              >
                {saving ? <FaSpinner className="animate-spin" /> : <FaUser />} Excluir
              </button>
            </>
          )}
          
          {isEditing && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg disabled:opacity-60"
            >
              {saving ? <FaSpinner className="animate-spin" /> : <FaSave />} Salvar
            </button>
          )}
        </div>
      </div>

      {/* Success Message */}
      {saved && (
        <div className="flex items-center gap-2 text-green-400 bg-green-500/10 border border-green-500/30 p-4 rounded-lg">
          <FaCheckCircle /> Usuário atualizado com sucesso!
        </div>
      )}

      {/* User Info */}
      <div className="bg-dark-800/60 border border-dark-700/60 rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center">
            <span className="text-white font-bold text-xl">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{user.name}</h2>
            <p className="text-gray-400">{user.email}</p>
            <div className="flex items-center gap-4 mt-2">
              <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${
                user.is_admin 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                <FaShieldAlt size={10} />
                {user.is_admin ? 'Administrador' : 'Usuário'}
              </span>
              <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${
                user.is_active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {user.is_active ? <FaToggleOn size={10} /> : <FaToggleOff size={10} />}
                {user.is_active ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-dark-900/60 border border-dark-700/60 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">{user.stats.total_orders}</div>
            <div className="text-gray-400 text-sm">Total de Pedidos</div>
          </div>
          <div className="bg-dark-900/60 border border-dark-700/60 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">{user.stats.total_addresses}</div>
            <div className="text-gray-400 text-sm">Endereços</div>
          </div>
          <div className="bg-dark-900/60 border border-dark-700/60 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">
              {user.email_verified ? 'Sim' : 'Não'}
            </div>
            <div className="text-gray-400 text-sm">Email Verificado</div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1 flex items-center gap-2">
              <FaUser size={12} /> Nome
            </label>
            <input
              value={user.name}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
              disabled={!isEditing}
              className="w-full bg-dark-900 border border-dark-700 rounded-lg p-2 text-white disabled:opacity-70"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1 flex items-center gap-2">
              <FaEnvelope size={12} /> Email
            </label>
            <input
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
              disabled={!isEditing}
              className="w-full bg-dark-900 border border-dark-700 rounded-lg p-2 text-white disabled:opacity-70"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1 flex items-center gap-2">
              <FaPhone size={12} /> Telefone
            </label>
            <input
              value={user.phone}
              onChange={(e) => setUser({ ...user, phone: e.target.value })}
              disabled={!isEditing}
              className="w-full bg-dark-900 border border-dark-700 rounded-lg p-2 text-white disabled:opacity-70"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1 flex items-center gap-2">
              <FaIdCard size={12} /> CPF
            </label>
            <input
              value={user.cpf}
              onChange={(e) => setUser({ ...user, cpf: e.target.value })}
              disabled={!isEditing}
              className="w-full bg-dark-900 border border-dark-700 rounded-lg p-2 text-white disabled:opacity-70"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1 flex items-center gap-2">
              <FaCalendar size={12} /> Data de Nascimento
            </label>
            <input
              type="date"
              value={user.birth_date || ''}
              onChange={(e) => setUser({ ...user, birth_date: e.target.value })}
              disabled={!isEditing}
              className="w-full bg-dark-900 border border-dark-700 rounded-lg p-2 text-white disabled:opacity-70"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1 flex items-center gap-2">
              <FaVenusMars size={12} /> Gênero
            </label>
            <select
              value={user.gender || ''}
              onChange={(e) => setUser({ ...user, gender: e.target.value })}
              disabled={!isEditing}
              className="w-full bg-dark-900 border border-dark-700 rounded-lg p-2 text-white disabled:opacity-70"
            >
              <option value="">Selecione</option>
              <option value="male">Masculino</option>
              <option value="female">Feminino</option>
              <option value="other">Outro</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1 flex items-center gap-2">
              <FaShieldAlt size={12} /> Tipo de Usuário
            </label>
            <select
              value={user.is_admin ? 'true' : 'false'}
              onChange={(e) => setUser({ ...user, is_admin: e.target.value === 'true' })}
              disabled={!isEditing}
              className="w-full bg-dark-900 border border-dark-700 rounded-lg p-2 text-white disabled:opacity-70"
            >
              <option value="false">Usuário</option>
              <option value="true">Administrador</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1 flex items-center gap-2">
              <FaToggleOn size={12} /> Status
            </label>
            <select
              value={user.is_active ? 'true' : 'false'}
              onChange={(e) => setUser({ ...user, is_active: e.target.value === 'true' })}
              disabled={!isEditing}
              className="w-full bg-dark-900 border border-dark-700 rounded-lg p-2 text-white disabled:opacity-70"
            >
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
          </div>
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Criado em:</span>
            <div className="text-white">{new Date(user.createdAt).toLocaleDateString('pt-BR')}</div>
          </div>
          <div>
            <span className="text-gray-400">Última atualização:</span>
            <div className="text-white">{new Date(user.updatedAt).toLocaleDateString('pt-BR')}</div>
          </div>
          {user.last_login && (
            <div>
              <span className="text-gray-400">Último login:</span>
              <div className="text-white">{new Date(user.last_login).toLocaleDateString('pt-BR')}</div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      {user.recent_orders.length > 0 && (
        <div className="bg-dark-800/60 border border-dark-700/60 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <FaShoppingBag /> Pedidos Recentes
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-dark-700">
                  <th className="text-left text-gray-400 text-sm py-2">Pedido</th>
                  <th className="text-left text-gray-400 text-sm py-2">Total</th>
                  <th className="text-left text-gray-400 text-sm py-2">Status</th>
                  <th className="text-left text-gray-400 text-sm py-2">Data</th>
                </tr>
              </thead>
              <tbody>
                {user.recent_orders.map((order) => (
                  <tr key={order.id} className="border-b border-dark-800">
                    <td className="py-2 text-white">{order.order_number}</td>
                    <td className="py-2 text-white">R$ {order.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="py-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status === 'delivered' ? 'Entregue' :
                         order.status === 'shipped' ? 'Enviado' :
                         order.status === 'processing' ? 'Processando' :
                         order.status}
                      </span>
                    </td>
                    <td className="py-2 text-gray-300">{new Date(order.createdAt).toLocaleDateString('pt-BR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Addresses */}
      {user.addresses.length > 0 && (
        <div className="bg-dark-800/60 border border-dark-700/60 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <FaMapMarkerAlt /> Endereços
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user.addresses.map((address) => (
              <div key={address.id} className="bg-dark-900/60 border border-dark-700/60 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Endereço {address.is_default ? '(Padrão)' : ''}</span>
                  {address.is_default && (
                    <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">Padrão</span>
                  )}
                </div>
                <div className="text-white text-sm">
                  <p>{address.street}, {address.number}</p>
                  {address.complement && <p>{address.complement}</p>}
                  <p>{address.neighborhood}</p>
                  <p>{address.city} - {address.state}</p>
                  <p className="text-gray-400">{address.zip_code}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}



