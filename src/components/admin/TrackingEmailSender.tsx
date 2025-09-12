'use client'

import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope, faTruck, faCheckCircle, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'

interface TrackingEmailSenderProps {
  orderId: number
  orderNumber: string
  customerEmail: string
  customerName: string
  currentTrackingCode?: string
  onEmailSent?: () => void
}

export default function TrackingEmailSender({
  orderId,
  orderNumber,
  customerEmail,
  customerName,
  currentTrackingCode,
  onEmailSent
}: TrackingEmailSenderProps) {
  const [trackingCode, setTrackingCode] = useState(currentTrackingCode || '')
  const [isSending, setIsSending] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')

  const handleSendEmail = async () => {
    if (!trackingCode.trim()) {
      setMessage('Por favor, digite um código de rastreio')
      setMessageType('error')
      return
    }

    setIsSending(true)
    setMessage('')
    setMessageType('')

    try {
      const response = await fetch('/api/admin/orders/send-tracking-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          trackingCode: trackingCode.trim()
        })
      })

      const data = await response.json()

      if (data.success) {
        setMessage('E-mail de rastreio enviado com sucesso!')
        setMessageType('success')
        onEmailSent?.()
      } else {
        setMessage(data.error || 'Erro ao enviar e-mail')
        setMessageType('error')
      }
    } catch (error) {
      setMessage('Erro ao enviar e-mail. Tente novamente.')
      setMessageType('error')
    } finally {
      setIsSending(false)
    }
  }

  const open17Track = () => {
    if (trackingCode) {
      const url = `https://17track.net/en/track?nums=${trackingCode}`
      window.open(url, '_blank')
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <FontAwesomeIcon icon={faEnvelope} className="text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Enviar E-mail de Rastreio
          </h3>
          <p className="text-sm text-gray-600">
            Notificar cliente sobre código de rastreio
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Informações do Pedido */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Informações do Pedido</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Número:</span>
              <p className="font-medium text-gray-900">#{orderNumber}</p>
            </div>
            <div>
              <span className="text-gray-600">Cliente:</span>
              <p className="font-medium text-gray-900">{customerName}</p>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600">E-mail:</span>
              <p className="font-medium text-gray-900">{customerEmail}</p>
            </div>
          </div>
        </div>

        {/* Código de Rastreio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Código de Rastreio
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              placeholder="Ex: BR123456789BR"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={open17Track}
              disabled={!trackingCode}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              title="Verificar no 17Track"
            >
              <FontAwesomeIcon icon={faTruck} />
              17Track
            </button>
          </div>
        </div>

        {/* Mensagem de Status */}
        {message && (
          <div className={`p-3 rounded-md ${
            messageType === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <div className="flex items-center gap-2">
              <FontAwesomeIcon 
                icon={messageType === 'success' ? faCheckCircle : faExclamationTriangle} 
                className={messageType === 'success' ? 'text-green-600' : 'text-red-600'} 
              />
              {message}
            </div>
          </div>
        )}

        {/* Botão de Envio */}
        <button
          onClick={handleSendEmail}
          disabled={isSending || !trackingCode.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center gap-2"
        >
          {isSending ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Enviando...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faEnvelope} />
              Enviar E-mail de Rastreio
            </>
          )}
        </button>

        {/* Informações Adicionais */}
        <div className="text-xs text-gray-500 text-center">
          <p>O cliente receberá um e-mail com:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Código de rastreio atualizado</li>
            <li>Link direto para o 17Track</li>
            <li>Instruções para rastreio manual</li>
            <li>Informações do pedido</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

