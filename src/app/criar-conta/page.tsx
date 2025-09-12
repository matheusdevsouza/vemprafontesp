'use client';

import Link from 'next/link';
import { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { EnvelopeSimple, X } from 'phosphor-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CriarContaPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);
  const [showVerifyEmailModal, setShowVerifyEmailModal] = useState(false);
  
  const { register } = useAuth();
  const router = useRouter();

  // Validação de força da senha
  const validatePassword = (password: string) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const errors = [];
    if (password.length < minLength) errors.push(`Mínimo de ${minLength} caracteres`);
    if (!hasUpperCase) errors.push('Pelo menos uma letra maiúscula');
    if (!hasLowerCase) errors.push('Pelo menos uma letra minúscula');
    if (!hasNumbers) errors.push('Pelo menos um número');
    if (!hasSpecialChar) errors.push('Pelo menos um caractere especial');
    
    return {
      isValid: errors.length === 0,
      errors,
      strength: Math.max(0, 5 - errors.length)
    };
  };

  const passwordValidation = validatePassword(formData.password);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Validações de segurança
    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'As senhas não coincidem' });
      setLoading(false);
      return;
    }

    if (!passwordValidation.isValid) {
      setMessage({ type: 'error', text: 'A senha não atende aos requisitos de segurança' });
      setLoading(false);
      return;
    }

    // Validação de e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setMessage({ type: 'error', text: 'E-mail inválido' });
      setLoading(false);
      return;
    }

    // Validação de nome
    if (formData.name.trim().length < 2) {
      setMessage({ type: 'error', text: 'Nome deve ter pelo menos 2 caracteres' });
      setLoading(false);
      return;
    }

    try {
      const result = await register({
        ...formData,
        cpf: '',
        birth_date: '',
        gender: undefined as 'M' | 'F' | 'Other' | undefined,
      });
      
      if (result.success) {
        setShowVerifyEmailModal(true);
        setMessage(null);
        if (result.warning) {
          setTimeout(() => {
            setMessage({ type: 'warning', text: result.warning! });
          }, 3000);
        }
        // Removido o redirecionamento para /login
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro interno do servidor' });
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = (strength: number) => {
    if (strength <= 1) return 'bg-red-500';
    if (strength <= 2) return 'bg-orange-500';
    if (strength <= 3) return 'bg-yellow-500';
    if (strength <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = (strength: number) => {
    if (strength <= 1) return 'Muito fraca';
    if (strength <= 2) return 'Fraca';
    if (strength <= 3) return 'Média';
    if (strength <= 4) return 'Forte';
    return 'Muito forte';
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-dark-950 py-12 px-4">
      <div className="w-full max-w-md bg-dark-900 border border-dark-800 rounded-3xl shadow-2xl p-8 flex flex-col gap-8">
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 mb-2">
            <Image src="/images/Logo.png" alt="Logo" width={64} height={64} className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-2 text-center">Criar uma conta</h1>
          <p className="text-gray-400 text-center text-sm">Preencha os campos abaixo para se cadastrar.</p>
        </div>

        <AnimatePresence>
          {showVerifyEmailModal && (
            <motion.div
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-dark-900 border border-dark-700 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center relative"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.22 }}
              >
                <button
                  className="absolute top-4 right-4 text-gray-400 hover:text-primary-400 transition-colors"
                  onClick={() => setShowVerifyEmailModal(false)}
                  aria-label="Fechar"
                >
                  <X size={24} />
                </button>
                <EnvelopeSimple size={48} className="mx-auto mb-4 text-primary-400" />
                <h2 className="text-xl font-bold text-white mb-2">Verifique seu e-mail</h2>
                <p className="text-gray-300 mb-4">Enviamos um link de confirmação para o seu e-mail. Por favor, acesse sua caixa de entrada e clique no link para ativar sua conta.</p>
                <button
                  className="mt-2 px-6 py-2 rounded-lg bg-primary-500 text-white font-bold hover:bg-primary-600 transition-colors"
                  onClick={() => setShowVerifyEmailModal(false)}
                >
                  Ok, entendi
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {message && !showVerifyEmailModal && (
          <div className={`p-4 rounded-lg text-sm ${
            message.type === 'success' 
              ? 'bg-green-500/20 border border-green-500/30 text-green-400'
              : message.type === 'warning'
              ? 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-400'
              : 'bg-red-500/20 border border-red-500/30 text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-gray-300 font-semibold">Nome Completo *</label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="px-4 py-3 rounded-lg border-2 border-dark-700 bg-dark-800 text-white focus:border-primary-500 outline-none transition-all"
              placeholder="Digite seu nome completo"
              minLength={2}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-gray-300 font-semibold">E-mail *</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="px-4 py-3 rounded-lg border-2 border-dark-700 bg-dark-800 text-white focus:border-primary-500 outline-none transition-all"
              placeholder="Digite seu e-mail"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="phone" className="text-gray-300 font-semibold">Telefone</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              value={formData.phone}
              onChange={handleChange}
              className="px-4 py-3 rounded-lg border-2 border-dark-700 bg-dark-800 text-white focus:border-primary-500 outline-none transition-all"
              placeholder="(11) 99999-9999"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-gray-300 font-semibold">Senha *</label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="px-4 py-3 pr-12 rounded-lg border-2 border-dark-700 bg-dark-800 text-white focus:border-primary-500 outline-none transition-all w-full"
                placeholder="Crie uma senha segura"
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Indicador de força da senha */}
            {formData.password && (
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 bg-dark-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(passwordValidation.strength)}`}
                      style={{ width: `${(passwordValidation.strength / 5) * 100}%` }}
                    ></div>
                  </div>
                  <span className={`text-xs font-medium ${
                    passwordValidation.strength <= 2 ? 'text-red-400' :
                    passwordValidation.strength <= 3 ? 'text-yellow-400' :
                    passwordValidation.strength <= 4 ? 'text-blue-400' : 'text-green-400'
                  }`}>
                    {getPasswordStrengthText(passwordValidation.strength)}
                  </span>
                </div>
                
                {/* Lista de requisitos */}
                <div className="text-xs text-gray-400 space-y-1">
                  <div className={`flex items-center gap-2 ${formData.password.length >= 8 ? 'text-green-400' : 'text-gray-500'}`}>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Mínimo 8 caracteres
                  </div>
                  <div className={`flex items-center gap-2 ${/[A-Z]/.test(formData.password) ? 'text-green-400' : 'text-gray-500'}`}>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Uma letra maiúscula
                  </div>
                  <div className={`flex items-center gap-2 ${/[a-z]/.test(formData.password) ? 'text-green-400' : 'text-gray-500'}`}>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Uma letra minúscula
                  </div>
                  <div className={`flex items-center gap-2 ${/\d/.test(formData.password) ? 'text-green-400' : 'text-gray-500'}`}>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Um número
                  </div>
                  <div className={`flex items-center gap-2 ${/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? 'text-green-400' : 'text-gray-500'}`}>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Um caractere especial
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="confirmPassword" className="text-gray-300 font-semibold">Confirmar Senha *</label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="px-4 py-3 pr-12 rounded-lg border-2 border-dark-700 bg-dark-800 text-white focus:border-primary-500 outline-none transition-all w-full"
                placeholder="Repita a senha"
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showConfirmPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            
            {/* Indicador de confirmação */}
            {formData.confirmPassword && (
              <div className={`text-xs flex items-center gap-2 ${
                formData.password === formData.confirmPassword ? 'text-green-400' : 'text-red-400'
              }`}>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {formData.password === formData.confirmPassword ? 'Senhas coincidem' : 'Senhas não coincidem'}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-2">
            <Link href="/login" className="text-primary-400 text-sm hover:underline">Já tenho uma conta!</Link>
            <Link href="/" className="text-gray-400 text-sm hover:underline">Voltar</Link>
          </div>
          
          <button
            type="submit"
            disabled={loading || !passwordValidation.isValid || formData.password !== formData.confirmPassword}
            className="mt-4 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-500/50 disabled:cursor-not-allowed text-white font-bold px-6 py-3 rounded-2xl text-lg shadow-lg transition-all duration-300 w-full"
          >
            {loading ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>
      </div>
    </section>
  );
} 