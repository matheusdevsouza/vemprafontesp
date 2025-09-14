'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function VerificarEmailPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();
  const { verifyEmail } = useAuth();
  const alreadyChecked = useRef(false);

  useEffect(() => {
    if (alreadyChecked.current) return;
    alreadyChecked.current = true;

    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Token de verificação não encontrado.');
      return;
    }

    const verifyToken = async () => {
      try {
        const result = await verifyEmail(token);
        
        if (result.success) {
          setStatus('success');
          setMessage(result.message);
          // Redirecionar para a página inicial após 3 segundos
          setTimeout(() => {
            router.push('/');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(result.message);
        }
      } catch (error) {
        setStatus('error');
        setMessage('Erro interno do servidor.');
      }
    };

    verifyToken();
  }, [searchParams, verifyEmail, router]);

  return (
    <section className="min-h-screen flex items-center justify-center bg-dark-950 py-12 px-4">
      <div className="w-full max-w-md bg-dark-900 border border-dark-800 rounded-3xl shadow-2xl p-8 flex flex-col gap-8">
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 mb-2">
            <Image src="/images/Logo.png" alt="Logo" width={64} height={64} className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-2 text-center">Verificação de E-mail</h1>
        </div>

        <div className="text-center">
          {status === 'loading' && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-400">Verificando seu e-mail...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-green-400 font-semibold">{message}</p>
              <p className="text-gray-400 text-sm">Redirecionando para a página inicial...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-red-400 font-semibold">{message}</p>
              <button
                onClick={() => router.push('/login')}
                className="mt-4 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-6 py-3 rounded-lg transition-all"
              >
                Ir para o Login
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
} 




