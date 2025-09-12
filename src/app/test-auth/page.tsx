'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function TestAuthPage() {
  const { user, authenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !authenticated) {
      router.push('/login');
    }
  }, [authenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Teste de Autenticação</h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Status da Autenticação</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-gray-400">Autenticado:</span>
              <span className={`ml-2 ${authenticated ? 'text-green-400' : 'text-red-400'}`}>
                {authenticated ? 'Sim' : 'Não'}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Carregando:</span>
              <span className={`ml-2 ${loading ? 'text-yellow-400' : 'text-green-400'}`}>
                {loading ? 'Sim' : 'Não'}
              </span>
            </div>
          </div>
        </div>

        {user && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Dados do Usuário</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-gray-400">ID:</span>
                <span className="ml-2 text-white">{user.id}</span>
              </div>
              <div>
                <span className="text-gray-400">Nome:</span>
                <span className="ml-2 text-white">{user.name}</span>
              </div>
              <div>
                <span className="text-gray-400">E-mail:</span>
                <span className="ml-2 text-white">{user.email}</span>
              </div>
              <div>
                <span className="text-gray-400">Admin:</span>
                <span className={`ml-2 ${user.is_admin ? 'text-green-400' : 'text-red-400'}`}>
                  {user.is_admin ? 'Sim' : 'Não'}
                </span>
              </div>
              <div>
                <span className="text-gray-400">E-mail Verificado:</span>
                <span className={`ml-2 ${user.email_verified_at ? 'text-green-400' : 'text-red-400'}`}>
                  {user.email_verified_at ? 'Sim' : 'Não'}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Ações</h2>
          <div className="flex gap-4">
            {user?.is_admin ? (
              <button
                onClick={() => router.push('/admin')}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors"
              >
                Acessar Dashboard Admin
              </button>
            ) : (
              <div className="text-yellow-400">
                Você não tem permissão de administrador para acessar o dashboard.
              </div>
            )}
            <button
              onClick={() => router.push('/')}
              className="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg transition-colors"
            >
              Voltar para Página Inicial
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
