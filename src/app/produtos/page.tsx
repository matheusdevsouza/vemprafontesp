"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";

export default function ProdutosPage() {
  const searchParams = useSearchParams();
  const [produtos, setProdutos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [modelos, setModelos] = useState<any[]>([]);
  const [modeloSelecionado, setModeloSelecionado] = useState<string | null>(null);
  const [precoMin, setPrecoMin] = useState(0);
  const [precoMax, setPrecoMax] = useState(2000);
  // Filtros
  const [filtros, setFiltros] = useState<{ preco: number[]; order: string }>({ preco: [0, 2000], order: '' });

  // Ler parâmetros da URL
  useEffect(() => {
    const search = searchParams.get('search');
    if (search) {
      setSearchQuery(search);
    }
  }, [searchParams]);

  // Buscar filtros dinâmicos e modelos
  useEffect(() => {
    async function fetchFiltros() {




      // Modelos
      const resModelos = await fetch('/api/models');
      const dataModelos = await resModelos.json();
      setModelos(dataModelos.data || []);
      // Faixa de preço real
      const resProdutos = await fetch('/api/products');
      const dataProdutos = await resProdutos.json();
      const precos = (dataProdutos.data || []).map((p: any) => p.price);
      if (precos.length) {
        const min = Math.min(...precos);
        const max = Math.max(...precos);
        setPrecoMin(min);
        setPrecoMax(max);
        setFiltros(f => ({ ...f, preco: [min, max] }));
      }
    }
    fetchFiltros();
  }, []);

  // Buscar produtos filtrados OU por modelo
  useEffect(() => {
    async function fetchProdutos() {
      setLoading(true);
      if (modeloSelecionado) {
        // Buscar produtos do modelo selecionado
        const res = await fetch(`/api/products/by-model/${modeloSelecionado}`);
        const data = await res.json();
        setProdutos(data.data || []);
        setLoading(false);
        return;
      }
      // Buscar produtos normalmente
      const params = new URLSearchParams();

      // Adicionar parâmetro de busca se existir
      if (searchQuery) {
        params.append('search', searchQuery);
      }

      if (filtros.preco) {
        params.append('min_price', String(filtros.preco[0]));
        params.append('max_price', String(filtros.preco[1]));
      }
      if (filtros.order) params.append('order', filtros.order);
      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      setProdutos(data.data || []);
      setLoading(false);
    }
    fetchProdutos();
  }, [filtros, modeloSelecionado, searchQuery]);

  // Handlers
  function handlePrecoChange(e: any) {
    const value = Number(e.target.value);
    setFiltros(f => ({ ...f, preco: [precoMin, value] }));
  }
  function handleOrderChange(e: any) {
    setFiltros(f => ({ ...f, order: e.target.value }));
  }
  function handleModeloClick(slug: string) {
    setModeloSelecionado(prev => prev === slug ? null : slug);
  }

  return (
    <section className="min-h-screen bg-dark-900 py-8 md:py-12">
      <div className="container mx-auto px-4">
        {loading ? (
          <div className="text-center mb-8">
            <div className="h-12 bg-gray-800 rounded-lg mx-auto max-w-md mb-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-shimmer"></div>
            </div>
            <div className="h-6 bg-gray-800 rounded-md mx-auto max-w-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-shimmer"></div>
            </div>
          </div>
        ) : (
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 text-center">
              {searchQuery ? `Resultados para "${searchQuery}"` : 'Todos os Produtos'}
            </h1>
            <p className="text-gray-400 text-lg mb-8 text-center">
              {searchQuery 
                ? `${produtos.length} produto(s) encontrado(s)` 
                : 'Encontre o modelo perfeito para você'
              }
            </p>
            {searchQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => {
                  setSearchQuery('')
                  window.history.pushState({}, '', '/produtos')
                }}
                className="inline-flex items-center gap-2 bg-dark-800 hover:bg-dark-700 text-gray-300 hover:text-white px-4 py-2 rounded-lg transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Limpar busca
              </motion.button>
            )}
          </motion.div>
        )}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filtros laterais */}
          <div className="md:w-64 md:self-start">
            {loading ? (
              <aside className="w-full bg-dark-800/80 border border-dark-700 rounded-2xl p-6 mb-4 md:mb-0 shadow-xl md:sticky md:top-8 animate-pulse">
                <h2 className="text-lg font-bold text-white mb-4">Filtrar</h2>

                {/* Skeleton Modelos */}
                <div className="mb-6">
                  <div className="h-4 w-20 bg-dark-700 rounded mb-2" />
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-7 w-24 bg-dark-700 rounded-lg" />
                    ))}
                  </div>
                </div>

                {/* Skeleton Preço */}
                <div className="mb-6">
                  <div className="h-4 w-16 bg-dark-700 rounded mb-2" />
                  <div className="h-5 w-full bg-dark-700 rounded mb-2" />
                  <div className="h-3 w-20 bg-dark-700 rounded" />
                </div>
                {/* Skeleton Ordem */}
                <div className="mb-2">
                  <div className="h-4 w-24 bg-dark-700 rounded mb-2" />
                  <div className="h-8 w-full bg-dark-700 rounded-lg" />
                </div>
              </aside>
            ) : (
              <aside className="w-full bg-dark-800/80 border border-dark-700 rounded-2xl p-6 mb-4 md:mb-0 shadow-xl md:sticky md:top-8">
                <h2 className="text-lg font-bold text-white mb-4">Filtrar</h2>

                {/* Modelos */}
                <div className="mb-6">
                  <label className="block text-gray-300 font-semibold mb-2">Modelos</label>
                  <div className="flex flex-wrap gap-2">
                    {modelos.map((modelo: any) => (
                      <button
                        key={modelo.slug}
                        onClick={() => handleModeloClick(modelo.slug)}
                        className={`flex items-center gap-2 px-3 py-1 rounded-lg border border-dark-700 text-gray-200 hover:bg-primary-500/20 hover:text-primary-400 transition-all text-sm
                          ${modeloSelecionado === modelo.slug ? 'bg-primary-500/20 text-primary-400 border-primary-400' : ''}`}
                      >
                        {modelo.image_url && (
                          <Image src={modelo.image_url} alt={modelo.name} width={24} height={24} className="rounded-full object-cover" />
                        )}
                        {modelo.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preço */}
                <div className="mb-6">
                  <label className="block text-gray-300 font-semibold mb-2">Preço (R$)</label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm">{precoMin}</span>
                    <input 
                      type="range" 
                      min={precoMin} 
                      max={precoMax} 
                      step={10} 
                      value={filtros.preco[1]} 
                      onChange={handlePrecoChange} 
                      className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, #C0192B 0%, #C0192B ${((filtros.preco[1] - precoMin) / (precoMax - precoMin)) * 100}%, #374151 ${((filtros.preco[1] - precoMin) / (precoMax - precoMin)) * 100}%, #374151 100%)`
                      }}
                    />
                    <span className="text-gray-400 text-sm">{precoMax}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Até <b className="text-primary-400">{filtros.preco[1]}</b></div>
                </div>
                {/* Ordem */}
                <div className="mb-2">
                  <label className="block text-gray-300 font-semibold mb-2">Ordenar por</label>
                  <select className="w-full rounded-lg border border-dark-700 bg-dark-900 text-gray-200 px-3 py-2" value={filtros.order} onChange={handleOrderChange}>
                    <option value="">Mais vendidos</option>
                    <option value="price_asc">Menor preço</option>
                    <option value="price_desc">Maior preço</option>
                    <option value="newest">Novidades</option>
                  </select>
                </div>
              </aside>
            )}
          </div>
          {/* Grid de produtos */}
          <main className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="group bg-dark-800/80 rounded-2xl overflow-hidden border border-dark-700/50 flex flex-col items-center p-4 shadow-lg animate-pulse">
                    <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-3 bg-dark-900">
                      <div className="absolute inset-0 bg-dark-700/60 animate-pulse" />
                    </div>
                    <div className="h-4 w-3/4 bg-dark-700 rounded mb-2 animate-pulse" />
                    <div className="h-3 w-1/2 bg-dark-700 rounded mb-1 animate-pulse" />
                    <div className="h-5 w-1/2 bg-dark-700 rounded mb-2 animate-pulse" />
                    <div className="w-full h-8 bg-dark-700 rounded-xl mt-auto animate-pulse" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {produtos.map((prod) => (
                  <Link key={prod.id} href={`/produto/${prod.slug}`} className="group bg-dark-800/80 rounded-2xl overflow-hidden border border-dark-700/50 hover:border-primary-500/30 transition-all duration-500 flex flex-col items-center p-4 shadow-lg hover:shadow-primary-500/10">
                    <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-3 bg-dark-900">
                      <Image src={prod.primary_image || (prod.images && prod.images[0]?.url) || prod.image || '/images/Logo.png'} alt={prod.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 768px) 100vw, 220px" />
                    </div>
                    <h3 className="text-base font-semibold text-white text-center group-hover:text-primary-400 transition-colors duration-300 mb-1 line-clamp-2">{prod.name}</h3>
    
                    <span className="text-primary-400 font-bold text-lg mb-2">R$ {prod.price}</span>
                    <button className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold px-4 py-2 rounded-xl text-sm transition-all duration-200 mt-auto">Ver detalhes</button>
                  </Link>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </section>
  );
} 