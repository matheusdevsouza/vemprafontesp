'use client'

import React, { useMemo, useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export const dynamic = 'force-dynamic'

function ResetPasswordInner() {
  const searchParams = useSearchParams()
  const token = useMemo(() => searchParams.get('token') || '', [searchParams])

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) {
      setError('Token ausente ou inválido. Solicite novamente a redefinição.')
    }
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!token) {
      setError('Token inválido')
      return
    }

    if (!password || !confirmPassword) {
      setError('Informe a nova senha e a confirmação')
      return
    }
    if (password !== confirmPassword) {
      setError('As senhas não conferem')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, confirmPassword })
      })
      const data = await res.json()
      if (data.success) {
        setMessage('Senha redefinida com sucesso! Você já pode fazer login.')
      } else {
        setError(data.message || 'Não foi possível redefinir sua senha')
      }
    } catch (err) {
      setError('Erro ao processar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="min-h-[70vh] w-full flex items-center justify-center bg-dark-950 py-12 px-4">
      <div className="w-full max-w-md bg-dark-900 border border-dark-800 rounded-xl p-6 shadow-xl">
        <h1 className="text-2xl font-semibold text-white text-center">Redefinir Senha</h1>
        <p className="text-dark-300 text-center mt-2">Crie uma nova senha para sua conta.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm text-dark-200 mb-1">Nova senha</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full rounded-lg bg-dark-800 border border-dark-700 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-600"
            />
          </div>

          <div>
            <label htmlFor="confirm" className="block text-sm text-dark-200 mb-1">Confirmar nova senha</label>
            <input
              id="confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full rounded-lg bg-dark-800 border border-dark-700 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !token}
            className="w-full rounded-lg bg-rose-600 hover:bg-rose-700 transition-colors text-white py-2 font-medium disabled:opacity-60"
          >
            {loading ? 'Redefinindo...' : 'Redefinir senha'}
          </button>

          {message && (
            <div className="text-sm text-green-400 text-center">{message}</div>
          )}
          {error && (
            <div className="text-sm text-rose-400 text-center">{error}</div>
          )}
        </form>

        <div className="text-center mt-6">
          <Link href="/login" className="text-sm text-rose-400 hover:underline">Ir para o login</Link>
        </div>
      </div>
    </section>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-[50vh]" />}> 
      <ResetPasswordInner />
    </Suspense>
  )
}
