'use client'

import React, { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Informe um e-mail válido')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      if (data.success) {
        setMessage('Se o e-mail existir, enviaremos um link para redefinição.')
      } else {
        setError(data.message || 'Não foi possível processar sua solicitação')
      }
    } catch (err) {
      setError('Erro ao enviar solicitação. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="min-h-[70vh] w-full flex items-center justify-center bg-dark-950 py-12 px-4">
      <div className="w-full max-w-md bg-dark-900 border border-dark-800 rounded-xl p-6 shadow-xl">
        <h1 className="text-2xl font-semibold text-white text-center">Esqueci minha senha</h1>
        <p className="text-dark-300 text-center mt-2">Informe seu e-mail e enviaremos um link para redefinição.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm text-dark-200 mb-1">E-mail</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full rounded-lg bg-dark-800 border border-dark-700 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-rose-600 hover:bg-rose-700 transition-colors text-white py-2 font-medium disabled:opacity-60"
          >
            {loading ? 'Enviando...' : 'Enviar link de redefinição'}
          </button>

          {message && (
            <div className="text-sm text-green-400 text-center">{message}</div>
          )}
          {error && (
            <div className="text-sm text-rose-400 text-center">{error}</div>
          )}
        </form>

        <div className="text-center mt-6">
          <Link href="/login" className="text-sm text-rose-400 hover:underline">Voltar ao login</Link>
        </div>
      </div>
    </section>
  )
}
