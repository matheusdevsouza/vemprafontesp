'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faTruck, faMapMarkerAlt, faClock, faBox, faCheckCircle } from '@fortawesome/free-solid-svg-icons'
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons'

interface TrackingResult {
  orderNumber: string
  status: string
  trackingCode: string
  lastUpdate: string
  location: string
  description: string
}

export default function RastreioPage() {
  const [trackingCode, setTrackingCode] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [trackingResult, setTrackingResult] = useState<TrackingResult | null>(null)
  const [error, setError] = useState('')

  const handleSearch = async () => {
    if (!trackingCode.trim()) {
      setError('Por favor, digite um código de rastreio')
      return
    }

    setIsSearching(true)
    setError('')
    setTrackingResult(null)

    try {
      // Buscar rastreio na API real
      const response = await fetch(`/api/tracking/search?code=${encodeURIComponent(trackingCode)}`)
      const data = await response.json()

      if (data.success) {
        const result: TrackingResult = {
          orderNumber: data.data.orderNumber,
          status: data.data.status,
          trackingCode: data.data.trackingCode,
          lastUpdate: new Date(data.data.lastUpdate).toLocaleDateString('pt-BR'),
          location: data.data.location,
          description: data.data.description
        }
        setTrackingResult(result)
      } else {
        setError(data.error || 'Pedido não encontrado')
      }
    } catch (error) {
      setError('Erro ao buscar rastreio. Tente novamente.')
    } finally {
      setIsSearching(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const open17Track = () => {
    if (trackingCode) {
      const url = `https://17track.net/en/track?nums=${trackingCode}`
      window.open(url, '_blank')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950">
      {/* Header */}
      <div className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full mb-6">
              <FontAwesomeIcon 
                icon={faTruck} 
                className="text-white text-3xl" 
              />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Rastreio de Pedidos
            </h1>
            
            <p className="text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto">
              Acompanhe o status do seu pedido em tempo real usando o código de rastreio
            </p>
          </motion.div>
        </div>
      </div>

      {/* Formulário de Busca */}
      <div className="max-w-2xl mx-auto px-4 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-dark-800/50 backdrop-blur-sm rounded-3xl p-8 border border-dark-700/50"
        >
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Digite seu código de rastreio
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Código de Rastreio
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ex: BR123456789BR"
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <FontAwesomeIcon 
                  icon={faSearch} 
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" 
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-red-400 text-sm text-center bg-red-900/20 border border-red-500/30 rounded-lg p-3"
              >
                {error}
              </motion.div>
            )}

            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSearching ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Rastreando...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSearch} />
                  Rastrear Pedido
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Resultado do Rastreio */}
      {trackingResult && (
        <div className="max-w-4xl mx-auto px-4 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-dark-800/50 backdrop-blur-sm rounded-3xl p-8 border border-dark-700/50"
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-400 text-2xl" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Pedido Encontrado!
              </h2>
              <p className="text-gray-400">
                Acompanhe o status do seu pedido
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-dark-700/50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <FontAwesomeIcon icon={faBox} className="text-primary-400" />
                  Informações do Pedido
                </h3>
                <div className="space-y-3 text-gray-300">
                  <p><strong>Número:</strong> {trackingResult.orderNumber}</p>
                  <p><strong>Código:</strong> {trackingResult.trackingCode}</p>
                  <p><strong>Status:</strong> <span className="text-green-400">{trackingResult.status}</span></p>
                </div>
              </div>

              <div className="bg-dark-700/50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="text-primary-400" />
                  Localização
                </h3>
                <div className="space-y-3 text-gray-300">
                  <p><strong>Última Atualização:</strong> {trackingResult.lastUpdate}</p>
                  <p><strong>Local:</strong> {trackingResult.location}</p>
                  <p><strong>Descrição:</strong> {trackingResult.description}</p>
                </div>
              </div>
            </div>

            <div className="text-center space-y-4">
              <button
                onClick={open17Track}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 flex items-center gap-2 mx-auto"
              >
                <FontAwesomeIcon icon={faTruck} />
                Rastrear no 17Track
              </button>
              
              <p className="text-sm text-gray-400">
                Para mais detalhes, acesse o 17Track ou entre em contato conosco
              </p>
            </div>
          </motion.div>
        </div>
      )}

      {/* Informações Adicionais */}
      <div className="max-w-4xl mx-auto px-4 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-dark-800/50 backdrop-blur-sm rounded-3xl p-8 border border-dark-700/50"
        >
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Como rastrear seu pedido
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-400 text-2xl font-bold">1</span>
              </div>
              <h3 className="text-white font-semibold mb-2">Digite o código</h3>
              <p className="text-gray-400 text-sm">
                Cole o código de rastreio que você recebeu por e-mail
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-400 text-2xl font-bold">2</span>
              </div>
              <h3 className="text-white font-semibold mb-2">Clique em rastrear</h3>
              <p className="text-gray-400 text-sm">
                Clique no botão para buscar informações atualizadas
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-400 text-2xl font-bold">3</span>
              </div>
              <h3 className="text-white font-semibold mb-2">Acompanhe o status</h3>
              <p className="text-gray-400 text-sm">
                Veja onde está seu pedido e quando chegará
              </p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-gray-400 mb-4">
              Precisa de ajuda? Entre em contato conosco
            </p>
            <a
              href="https://wa.me/5511939025934"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300"
            >
              <FontAwesomeIcon icon={faWhatsapp} />
              Falar no WhatsApp
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
