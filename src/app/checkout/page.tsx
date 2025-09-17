'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { 
  CreditCard, 
  MapPin, 
  User, 
  Phone, 
  Envelope,
  Trash,
  Plus,
  Minus,
  ArrowLeft,
  Shield,
  Truck,
  Clock,
  CheckCircle,
  Warning,
  Lock,
  CreditCard as CreditCardIcon,
  QrCode,
  Bank,
  ShoppingCart,
  X,
  Info
} from 'phosphor-react'
import React from 'react'

interface CustomerData {
  name: string
  email: string
  emailConfirm: string
  phone: string
  cpf: string
  zipCode: string
  street: string
  number: string
  complement: string
  neighborhood: string
  city: string
  state: string
}

interface PaymentMethod {
  id: string
  name: string
  icon: React.ReactNode
  description: string
  installments?: number[]
}

export default function CheckoutPage() {
  const { state: cartState, removeItem, updateQuantity, clearCart } = useCart()
  const { user, authenticated } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('')
  const [errors, setErrors] = useState<string[]>([])
  const [showErrors, setShowErrors] = useState(false)
  const [guestChecklist, setGuestChecklist] = useState({
    acceptTerms: false,
    acceptTracking: false,
    acceptPrivacy: false
  })
  
  const [customerData, setCustomerData] = useState<CustomerData>({
    name: user?.display_name || user?.name || '',
    email: user?.email || '',
    emailConfirm: user?.email || '',
    phone: '',
    cpf: '',
    zipCode: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: ''
  })

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'credit_card',
      name: 'Cartão de Crédito',
      icon: <CreditCardIcon size={24} />,
      description: 'Pague em até 12x sem juros',
      installments: [1, 2, 3, 6, 12]
    },
    {
      id: 'pix',
      name: 'PIX',
      icon: <QrCode size={24} />,
      description: 'Pagamento instantâneo',
      installments: [1]
    },
    {
      id: 'bank_slip',
      name: 'Boleto Bancário',
      icon: <Bank size={24} />,
      description: 'Vencimento em 3 dias úteis',
      installments: [1]
    }
  ]

  // ✅ Total sem frete
  const total = cartState.total

  // Sincronizar e-mail de confirmação quando usuário estiver logado
  useEffect(() => {
    if (user?.email && customerData.email === user.email) {
      setCustomerData(prev => ({ ...prev, emailConfirm: user.email }))
    }
  }, [user?.email, customerData.email])
  
  const handleNextStep = () => {
    if (currentStep === 1) {
      // Validar campos obrigatórios da etapa 1
      const requiredFields = {
        name: 'Nome',
        email: 'E-mail',
        emailConfirm: 'Confirmação de E-mail',
        phone: 'Telefone',
        cpf: 'CPF',
        zipCode: 'CEP',
        street: 'Rua',
        number: 'Número',
        neighborhood: 'Bairro',
        city: 'Cidade',
        state: 'Estado'
      }

      const missingFields = []
      
      for (const [field, label] of Object.entries(requiredFields)) {
        if (!customerData[field as keyof CustomerData] || customerData[field as keyof CustomerData].trim() === '') {
          missingFields.push(label)
        }
      }

      const validationErrors = []

      // Campos obrigatórios
      if (missingFields.length > 0) {
        validationErrors.push(`Campos obrigatórios não preenchidos: ${missingFields.join(', ')}`)
      }

      // Validar formato do email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (customerData.email && !emailRegex.test(customerData.email)) {
        validationErrors.push('E-mail inválido')
      }

      // Validar confirmação de e-mail
      if (customerData.email !== customerData.emailConfirm) {
        validationErrors.push('Os e-mails não coincidem')
      }

      // Validar se ambos os e-mails estão preenchidos
      if (!customerData.email || !customerData.emailConfirm) {
        validationErrors.push('E-mail e confirmação são obrigatórios')
      }

      // Validar se os e-mails são idênticos
      if (customerData.email !== customerData.emailConfirm) {
        validationErrors.push('Os e-mails não coincidem')
      }

      // Validar formato do CPF (11 dígitos)
      const cpfClean = customerData.cpf.replace(/\D/g, '')
      if (customerData.cpf && cpfClean.length !== 11) {
        validationErrors.push('CPF deve ter 11 dígitos')
      }

      // Validar formato do telefone (mínimo 10 dígitos)
      const phoneClean = customerData.phone.replace(/\D/g, '')
      if (customerData.phone && phoneClean.length < 10) {
        validationErrors.push('Telefone deve ter pelo menos 10 dígitos')
      }

      // Validar formato do CEP (8 dígitos)
      const cepClean = customerData.zipCode.replace(/\D/g, '')
      if (customerData.zipCode && cepClean.length !== 8) {
        validationErrors.push('CEP deve ter 8 dígitos')
      }

      if (validationErrors.length > 0) {
        showErrorMessages(validationErrors)
        return
      }
    }

    if (currentStep === 2 && !selectedPaymentMethod) {
      showErrorMessages(['Por favor, selecione uma forma de pagamento'])
      return
    }

    setCurrentStep(prev => Math.min(prev + 1, 3))
  }

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleFinishOrder = async () => {
    // Verificar se o usuário não logado aceitou todos os termos
    if (!authenticated) {
      const allAccepted = Object.values(guestChecklist).every(accepted => accepted)
      if (!allAccepted) {
        showErrorMessages(['Por favor, aceite todos os termos para continuar'])
        return
      }
    }

    setIsLoading(true)
    try {
      // Preparar dados do checkout
      const checkoutData = {
        items: cartState.items.map(item => ({
          product_id: item.product.id,
          name: item.product.name,
          sku: (item.product as any).sku || null, // Usar SKU em vez de slug
          price: item.price,
          quantity: item.quantity,
          size: item.size || null,
          color: (item as any).color || null
        })),
        customer: {
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone
        },
        shipping_address: {
          street: customerData.street,
          number: customerData.number,
          complement: customerData.complement,
          neighborhood: customerData.neighborhood,
          city: customerData.city,
          state: customerData.state,
          zipcode: customerData.zipCode,
          shipping_cost: 0 // Frete grátis
        },
        payment_method: selectedPaymentMethod
      }

      // Criar pedido e redirecionar para Mercado Pago
      const response = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(checkoutData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao criar pedido')
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Erro ao criar pedido')
      }

      // Verificar se o Mercado Pago está configurado
      const initPoint = process.env.NODE_ENV === 'production' 
        ? result.init_point 
        : result.sandbox_init_point

      if (initPoint) {
        // Limpar carrinho antes de redirecionar
        clearCart()
        // Abrir checkout do Mercado Pago em nova aba/janela
        window.open(initPoint, '_blank', 'noopener,noreferrer')
        // Redirecionar para página principal
        router.push('/meus-pedidos')
      } else {
        // Mercado Pago não configurado - mostrar mensagem de sucesso
        clearCart()
        showErrorMessages(['Pedido criado com sucesso! O Mercado Pago não está configurado.'])
        // Redirecionar para página principal após 3 segundos
        setTimeout(() => {
          router.push('/meus-pedidos')
        }, 3000)
      }

    } catch (error) {
      console.error('Erro ao finalizar pedido:', error)
      showErrorMessages([`Erro ao finalizar pedido: ${(error as Error).message}`])
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId)
    } else {
      updateQuantity(productId, newQuantity)
    }
  }

  // Função para contar campos obrigatórios preenchidos
  const getRequiredFieldsCount = () => {
    const requiredFields = [
      customerData.name,
      customerData.email,
      customerData.emailConfirm,
      customerData.phone,
      customerData.cpf,
      customerData.zipCode,
      customerData.street,
      customerData.number,
      customerData.neighborhood,
      customerData.city,
      customerData.state
    ]
    
    const filledFields = requiredFields.filter(field => field && field.trim() !== '').length
    return { filled: filledFields, total: requiredFields.length }
  }

  // Função para exibir erros
  const showErrorMessages = (errorList: string[]) => {
    setErrors(errorList)
    setShowErrors(true)
    setTimeout(() => {
      setShowErrors(false)
    }, 5000) // Esconde após 5 segundos
  }

  if (cartState.items.length === 0) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="bg-dark-900 rounded-2xl p-8 max-w-md mx-4">
            <div className="flex justify-center mb-4">
              <ShoppingCart size={64} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Carrinho Vazio</h2>
            <p className="text-gray-400 mb-6">Adicione produtos ao seu carrinho para continuar com a compra.</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/produtos')}
              className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
            >
              Ver Produtos
            </motion.button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Header do Checkout */}
      <div className="container mx-auto px-4 py-4 pt-12">
        <div className="flex items-center justify-between">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            Voltar
          </motion.button>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <ShoppingCart size={20} className="text-primary-400" />
              <span className="text-white font-medium">{cartState.itemCount} item{cartState.itemCount !== 1 ? 's' : ''}</span>
            </div>
            <div className="text-white font-bold">
              R$ {total.toFixed(2)}
            </div>
          </div>
        </div>
        
        {/* Notificação para usuários não logados */}
        {!authenticated && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3"
          >
            <div className="flex items-center gap-2 text-blue-200 text-sm">
              <Info size={16} className="text-blue-400" />
              <span>
                <strong>Usuário sem conta:</strong> Você receberá o código de rastreio por e-mail quando o pedido for despachado
              </span>
            </div>
          </motion.div>
        )}
      </div>

      <div className="container mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulário Principal */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-dark-900 rounded-2xl p-6"
            >
              {/* Mensagens de Erro */}
              <AnimatePresence>
                {showErrors && errors.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6"
                  >
                    <div className="flex items-start gap-3">
                      <Warning size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="text-red-400 font-semibold mb-2">Erro na validação</h4>
                        <ul className="space-y-1">
                          {errors.map((error, index) => (
                            <li key={index} className="text-red-300 text-sm">
                              • {error}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <button
                        onClick={() => setShowErrors(false)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Passos do Checkout */}
              <div className="flex items-center justify-center mb-8">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                      currentStep >= step 
                        ? 'bg-primary-500 text-white' 
                        : 'bg-dark-700 text-gray-400'
                    }`}>
                      {step}
                    </div>
                    {step < 3 && (
                      <div className={`w-64 h-1 mx-2 ${
                        currentStep > step ? 'bg-primary-500' : 'bg-dark-700'
                      }`} />
                    )}
                  </div>
                ))}
              </div>

              {/* Passo 1: Dados Pessoais */}
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-2 mb-6">
                    <User size={24} className="text-primary-400" />
                    <h2 className="text-2xl font-bold text-white">Dados Pessoais</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 mb-2">Nome <span className="text-red-400">*</span></label>
                      <input
                        type="text"
                        value={customerData.name}
                        onChange={(e) => setCustomerData({...customerData, name: e.target.value})}
                        className={`w-full px-4 py-3 bg-dark-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 ${
                          customerData.name.trim() === '' ? 'border-red-500' : 'border-dark-700'
                        }`}
                        placeholder="Seu nome"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 mb-2">E-mail <span className="text-red-400">*</span></label>
                      <input
                        type="email"
                        value={customerData.email}
                        onChange={(e) => setCustomerData({...customerData, email: e.target.value})}
                        className={`w-full px-4 py-3 bg-dark-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 ${
                          customerData.email.trim() === '' ? 'border-red-500' : 'border-dark-700'
                        }`}
                        placeholder="seu@email.com"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 mb-2">Confirmar E-mail <span className="text-red-400">*</span></label>
                      <input
                        type="email"
                        value={customerData.emailConfirm}
                        onChange={(e) => setCustomerData({...customerData, emailConfirm: e.target.value})}
                        className={`w-full px-4 py-3 bg-dark-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 ${
                          customerData.emailConfirm.trim() === '' ? 'border-red-500' : 
                          customerData.email !== customerData.emailConfirm ? 'border-red-500' : 'border-dark-700'
                        }`}
                        placeholder="Confirme seu e-mail"
                        required
                      />
                      {customerData.emailConfirm.trim() !== '' && customerData.email !== customerData.emailConfirm && (
                        <p className="text-red-400 text-sm mt-1">Os e-mails não coincidem</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 mb-2">Telefone <span className="text-red-400">*</span></label>
                      <input
                        type="tel"
                        value={customerData.phone}
                        onChange={(e) => setCustomerData({...customerData, phone: e.target.value})}
                        className={`w-full px-4 py-3 bg-dark-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 ${
                          customerData.phone.trim() === '' ? 'border-red-500' : 'border-dark-700'
                        }`}
                        placeholder="(11) 99999-9999"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 mb-2">CPF <span className="text-red-400">*</span></label>
                      <input
                        type="text"
                        value={customerData.cpf}
                        onChange={(e) => setCustomerData({...customerData, cpf: e.target.value})}
                        className={`w-full px-4 py-3 bg-dark-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 ${
                          customerData.cpf.trim() === '' ? 'border-red-500' : 'border-dark-700'
                        }`}
                        placeholder="000.000.000-00"
                        required
                      />
                    </div>
                  </div>

                  {/* Endereço */}
                  <div className="pt-6 border-t border-dark-700">
                    <div className="flex items-center gap-2 mb-6">
                      <MapPin size={24} className="text-primary-400" />
                      <h3 className="text-xl font-bold text-white">Endereço de Entrega</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-gray-300 mb-2">CEP <span className="text-red-400">*</span></label>
                        <input
                          type="text"
                          value={customerData.zipCode}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 8)
                            setCustomerData({...customerData, zipCode: value})
                          }}
                          className={`w-full px-4 py-3 bg-dark-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 ${
                            customerData.zipCode.trim() === '' ? 'border-red-500' : 'border-dark-700'
                          }`}
                          placeholder="00000000"
                          maxLength={8}
                          required
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-gray-300 mb-2">Rua <span className="text-red-400">*</span></label>
                        <input
                          type="text"
                          value={customerData.street}
                          onChange={(e) => setCustomerData({...customerData, street: e.target.value})}
                          className={`w-full px-4 py-3 bg-dark-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 ${
                            customerData.street.trim() === '' ? 'border-red-500' : 'border-dark-700'
                          }`}
                          placeholder="Nome da rua"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-300 mb-2">Número <span className="text-red-400">*</span></label>
                        <input
                          type="text"
                          value={customerData.number}
                          onChange={(e) => setCustomerData({...customerData, number: e.target.value})}
                          className={`w-full px-4 py-3 bg-dark-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 ${
                            customerData.number.trim() === '' ? 'border-red-500' : 'border-dark-700'
                          }`}
                          placeholder="123"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-300 mb-2">Complemento</label>
                        <input
                          type="text"
                          value={customerData.complement}
                          onChange={(e) => setCustomerData({...customerData, complement: e.target.value})}
                          className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
                          placeholder="Apto, bloco, etc."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-300 mb-2">Bairro <span className="text-red-400">*</span></label>
                        <input
                          type="text"
                          value={customerData.neighborhood}
                          onChange={(e) => setCustomerData({...customerData, neighborhood: e.target.value})}
                          className={`w-full px-4 py-3 bg-dark-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 ${
                            customerData.neighborhood.trim() === '' ? 'border-red-500' : 'border-dark-700'
                          }`}
                          placeholder="Nome do bairro"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-300 mb-2">Cidade <span className="text-red-400">*</span></label>
                        <input
                          type="text"
                          value={customerData.city}
                          onChange={(e) => setCustomerData({...customerData, city: e.target.value})}
                          className={`w-full px-4 py-3 bg-dark-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 ${
                            customerData.city.trim() === '' ? 'border-red-500' : 'border-dark-700'
                          }`}
                          placeholder="Nome da cidade"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-300 mb-2">Estado <span className="text-red-400">*</span></label>
                        <input
                          type="text"
                          value={customerData.state}
                          onChange={(e) => setCustomerData({...customerData, state: e.target.value})}
                          className={`w-full px-4 py-3 bg-dark-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 ${
                            customerData.state.trim() === '' ? 'border-red-500' : 'border-dark-700'
                          }`}
                          placeholder="UF"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-6">
                    <div className="text-sm text-gray-400">
                      {getRequiredFieldsCount().filled} de {getRequiredFieldsCount().total} campos obrigatórios preenchidos
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleNextStep}
                      className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
                    >
                      Continuar
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Passo 2: Forma de Pagamento */}
              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-2 mb-6">
                    <CreditCard size={24} className="text-primary-400" />
                    <h2 className="text-2xl font-bold text-white">Forma de Pagamento</h2>
                  </div>

                  <div className="space-y-4">
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                          selectedPaymentMethod === method.id
                            ? 'border-primary-500 bg-primary-500/10'
                            : 'border-dark-700 hover:border-dark-600'
                        }`}
                        onClick={() => setSelectedPaymentMethod(method.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-primary-400">
                            {method.icon}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-white">{method.name}</h3>
                            <p className="text-sm text-gray-400">{method.description}</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 ${
                            selectedPaymentMethod === method.id
                              ? 'border-primary-500 bg-primary-500'
                              : 'border-dark-600'
                          }`}>
                            {selectedPaymentMethod === method.id && (
                              <div className="w-full h-full rounded-full bg-white scale-50" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between pt-6">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handlePrevStep}
                      className="bg-dark-800 hover:bg-dark-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
                    >
                      Voltar
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleNextStep}
                      disabled={!selectedPaymentMethod}
                      className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-8 py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continuar
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Passo 3: Confirmação */}
              {currentStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-2 mb-6">
                    <CheckCircle size={24} className="text-primary-400" />
                    <h2 className="text-2xl font-bold text-white">Confirmação do Pedido</h2>
                  </div>

                                     <div className="bg-dark-800 rounded-lg p-4">
                     <h3 className="font-semibold text-white mb-3">Resumo do Pedido</h3>
                     <div className="space-y-2 text-sm text-gray-300">
                       <div className="flex justify-between">
                         <span>Itens:</span>
                         <span>{cartState.itemCount} produto{cartState.itemCount !== 1 ? 's' : ''}</span>
                       </div>
                       <div className="flex justify-between">
                         <span>Subtotal:</span>
                         <span>R$ {cartState.total.toFixed(2)}</span>
                       </div>
                       <div className="border-t border-dark-700 pt-2 mt-2">
                         <div className="flex justify-between font-semibold text-white">
                           <span>Total Final:</span>
                           <span className="text-lg text-primary-400">R$ {total.toFixed(2)}</span>
                         </div>
                       </div>
                     </div>
                   </div>

                   {/* Checklist para usuários não logados */}
                   {!authenticated && (
                     <motion.div
                       initial={{ opacity: 0, y: 20 }}
                       animate={{ opacity: 1, y: 0 }}
                       className="bg-dark-800 rounded-lg p-6 border border-dark-700"
                     >
                       <div className="flex items-center gap-3 mb-4">
                         <Warning size={24} className="text-yellow-400" />
                         <h3 className="text-lg font-semibold text-white">Importante para Usuários sem Conta</h3>
                       </div>
                       
                       <div className="space-y-4 mb-6">
                         <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                           <p className="text-yellow-200 text-sm leading-relaxed">
                             <strong>⚠️ Atenção:</strong> Como você não está logado em uma conta, algumas funcionalidades estarão limitadas:
                           </p>
                           <ul className="mt-2 space-y-1 text-yellow-100 text-sm">
                             <li>• Não será possível acompanhar o pedido na seção &quot;Meus Pedidos&quot;</li>
                             <li>• O histórico de compras não ficará salvo no site</li>
                             <li>• Não será possível alterar dados do pedido após a compra</li>
                           </ul>
                         </div>
                         
                         <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                           <p className="text-blue-200 text-sm leading-relaxed">
                             <strong>📧 Boa notícia:</strong> Quando seu pedido for despachado, você receberá um e-mail com:
                           </p>
                           <ul className="mt-2 space-y-1 text-blue-100 text-sm">
                             <li>• Código de rastreio completo</li>
                             <li>• Link direto para o 17Track</li>
                             <li>• Instruções para rastreio manual no site</li>
                             <li>• Todas as informações do pedido</li>
                           </ul>
                         </div>
                       </div>

                       <div className="space-y-3">
                         <label className="flex items-start gap-3 cursor-pointer">
                           <input
                             type="checkbox"
                             checked={guestChecklist.acceptTerms}
                             onChange={(e) => setGuestChecklist(prev => ({ ...prev, acceptTerms: e.target.checked }))}
                             className="mt-1 w-4 h-4 text-primary-500 bg-dark-700 border-dark-600 rounded focus:ring-primary-500 focus:ring-2"
                           />
                           <span className="text-sm text-gray-300">
                             <span className="text-primary-400 font-medium">Aceito os termos de compra</span> e entendo que não estarei logado em uma conta
                           </span>
                         </label>
                         
                         <label className="flex items-start gap-3 cursor-pointer">
                           <input
                             type="checkbox"
                             checked={guestChecklist.acceptTracking}
                             onChange={(e) => setGuestChecklist(prev => ({ ...prev, acceptTracking: e.target.checked }))}
                             className="mt-1 w-4 h-4 text-primary-500 bg-dark-700 border-dark-600 rounded focus:ring-primary-500 focus:ring-2"
                           />
                           <span className="text-sm text-gray-300">
                             <span className="text-primary-400 font-medium">Aceito receber o código de rastreio por e-mail</span> quando o pedido for despachado
                           </span>
                         </label>
                         
                         <label className="flex items-start gap-3 cursor-pointer">
                           <input
                             type="checkbox"
                             checked={guestChecklist.acceptPrivacy}
                             onChange={(e) => setGuestChecklist(prev => ({ ...prev, acceptPrivacy: e.target.checked }))}
                             className="mt-1 w-4 h-4 text-primary-500 bg-dark-700 border-dark-600 rounded focus:ring-2 focus:ring-primary-500"
                           />
                           <span className="text-sm text-gray-300">
                             <span className="text-primary-400 font-medium">Aceito a política de privacidade</span> e autorizo o uso dos meus dados para processamento do pedido
                           </span>
                         </label>
                       </div>
                       
                       {/* Confirmação quando todos os termos foram aceitos */}
                       {Object.values(guestChecklist).every(accepted => accepted) && (
                         <motion.div
                           initial={{ opacity: 0, scale: 0.95 }}
                           animate={{ opacity: 1, scale: 1 }}
                           className="mt-4 bg-green-500/10 border border-green-500/20 rounded-lg p-3"
                         >
                           <div className="flex items-center gap-2 text-green-200 text-sm">
                             <CheckCircle size={16} className="text-green-400" />
                             <span>
                               <strong>Perfeito!</strong> Todos os termos foram aceitos. Você pode prosseguir com a compra.
                             </span>
                           </div>
                         </motion.div>
                       )}
                     </motion.div>
                   )}

                  <div className="flex justify-between pt-6">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handlePrevStep}
                      className="bg-dark-800 hover:bg-dark-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
                    >
                      Voltar
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleFinishOrder}
                      disabled={isLoading || (!authenticated && !Object.values(guestChecklist).every(accepted => accepted))}
                      className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Processando...' : 'Finalizar Pedido'}
                    </motion.button>
                    
                    {/* Mensagem quando botão está desabilitado */}
                    {!authenticated && !Object.values(guestChecklist).every(accepted => accepted) && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mt-3"
                      >
                        <p className="text-sm text-gray-400">
                          Para finalizar o pedido, aceite todos os termos acima
                        </p>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Sidebar com Resumo */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-dark-900 rounded-2xl p-6 sticky top-4"
            >
              <h3 className="text-lg font-bold text-white mb-4">Resumo do Pedido</h3>
              
              {/* Itens do carrinho */}
              <div className="space-y-3 mb-4">
                {cartState.items.map(item => (
                  <div key={item.product.id} className="flex gap-3">
                    <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-dark-800">
                      <Image
                        src={item.image || '/images/Logo.png'}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">{item.product.name}</h3>
                      <p className="text-sm text-gray-400">Tamanho: {item.size || 'Único'}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                            className="w-6 h-6 bg-dark-700 rounded-full flex items-center justify-center hover:bg-dark-600 transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-white font-semibold w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                            className="w-6 h-6 bg-dark-700 rounded-full flex items-center justify-center hover:bg-dark-600 transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold text-white">R$ {(Number(item.price) * item.quantity).toFixed(2)}</p>
                      <p className="text-sm text-gray-400">R$ {Number(item.price).toFixed(2)} cada</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totais */}
              <div className="space-y-3 border-t border-dark-700 pt-4">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal ({cartState.itemCount} itens)</span>
                  <span>R$ {cartState.total.toFixed(2)}</span>
                </div>
                
                 <div className="flex justify-between text-lg font-bold text-white border-t border-dark-700 pt-3">
                   <span>Total Final</span>
                   <span className="text-primary-400">R$ {total.toFixed(2)}</span>
                 </div>
                 
              </div>

              {/* Benefícios */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <Shield size={16} className="text-primary-400" />
                  <span>Compra 100% segura</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <Truck size={16} className="text-primary-400" />
                  <span>Entrega em todo Brasil</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <CheckCircle size={16} className="text-primary-400" />
                  <span>Garantia de 30 dias</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
} 