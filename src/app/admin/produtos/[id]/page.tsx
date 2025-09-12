"use client"

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { FaSpinner, FaSave, FaArrowLeft, FaCheckCircle } from 'react-icons/fa'

interface Product {
  id: number
  name: string
  description?: string
  price: number
  stock_quantity: number
  is_active: boolean
  sku?: string
}

export default function ProductDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = Number(params?.id)

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true)
        const res = await fetch(`/api/admin/products/${id}`)
        if (!res.ok) throw new Error('Falha ao carregar produto')
        const response = await res.json()
        const data = response.data // Os dados estão em response.data
        
        setProduct({
          id: data.id,
          name: data.name,
          description: data.description ?? '',
          price: Number(data.price ?? 0),
          stock_quantity: Number(data.stock_quantity ?? 0),
          is_active: Boolean(data.is_active),
          sku: data.sku ?? ''
        })
      } catch (e: any) {
        setError(e.message || 'Erro inesperado')
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchProduct()
  }, [id])

  async function handleSave() {
    if (!product) return
    try {
      setSaving(true)
      setError(null)
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: product.name,
          description: product.description,
          price: Number(product.price),
          stock_quantity: Number(product.stock_quantity),
          is_active: Boolean(product.is_active),
          sku: product.sku
        })
      })
      if (!res.ok) throw new Error('Falha ao salvar alterações')
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (e: any) {
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

  if (!product) return null

  return (
    <div className="p-6 space-y-6">
      <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-gray-300 hover:text-white">
        <FaArrowLeft /> Voltar
      </button>

      <div className="bg-dark-800/60 border border-dark-700/60 rounded-xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Editar Produto #{product.id}</h2>
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
            <FaCheckCircle /> Alterações salvas com sucesso
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nome</label>
            <input
              value={product.name}
              onChange={(e) => setProduct({ ...product, name: e.target.value })}
              className="w-full bg-dark-900 border border-dark-700 rounded-lg p-2 text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">SKU</label>
            <input
              value={product.sku || ''}
              onChange={(e) => setProduct({ ...product, sku: e.target.value })}
              className="w-full bg-dark-900 border border-dark-700 rounded-lg p-2 text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Preço</label>
            <input
              type="number"
              step="0.01"
              value={product.price}
              onChange={(e) => setProduct({ ...product, price: Number(e.target.value) })}
              className="w-full bg-dark-900 border border-dark-700 rounded-lg p-2 text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Estoque</label>
            <input
              type="number"
              value={product.stock_quantity}
              onChange={(e) => setProduct({ ...product, stock_quantity: Number(e.target.value) })}
              className="w-full bg-dark-900 border border-dark-700 rounded-lg p-2 text-white"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-400 mb-1">Descrição</label>
            <textarea
              rows={4}
              value={product.description || ''}
              onChange={(e) => setProduct({ ...product, description: e.target.value })}
              className="w-full bg-dark-900 border border-dark-700 rounded-lg p-2 text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Ativo</label>
            <select
              value={product.is_active ? 'true' : 'false'}
              onChange={(e) => setProduct({ ...product, is_active: e.target.value === 'true' })}
              className="w-full bg-dark-900 border border-dark-700 rounded-lg p-2 text-white"
            >
              <option value="true">Sim</option>
              <option value="false">Não</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
