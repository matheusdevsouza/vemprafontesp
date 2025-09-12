"use client"

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Heart, Share, Truck, Shield, Clock, Package, ArrowLeft, ArrowRight, MagnifyingGlass, MagnifyingGlassMinus } from "phosphor-react";
import Link from "next/link";
import { useCart } from '@/contexts/CartContext'
import { useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faShoePrints, faCheck, faMoneyBillWave } from '@fortawesome/free-solid-svg-icons';

export default function ProdutoPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [cep, setCep] = useState("");
  const [freteMsg, setFreteMsg] = useState("");
  const [zoomEnabled, setZoomEnabled] = useState(true);
  const [zoomPos, setZoomPos] = useState<{ x: number; y: number } | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const zoomRef = useRef<HTMLDivElement>(null);
  const [suggested, setSuggested] = useState<any[]>([]);
  const [similar, setSimilar] = useState<any[]>([]);
  const { addItem } = useCart();
  const [addedToCart, setAddedToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  // Pré-carregar todas as imagens do produto
  const preloadImages = useCallback((images: any[]) => {
    images.forEach((img) => {
      const imageElement = new window.Image();
      imageElement.src = img.url;
    });
  }, []);

  const handleAddToCart = useCallback(() => {
    if (!product) return;
    const image = product.primary_image || product.image || (product.images && product.images[0]?.url) || '/images/Logo.png';
    addItem(product, quantity, selectedSize || undefined, image);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }, [addItem, product, selectedSize, quantity]);

  const handleImageChange = useCallback((index: number) => {
    setSelectedImage(index);
    setCurrentImageIndex(index);
  }, []);

  const nextImage = useCallback(() => {
    if (!product?.images) return;
    const next = (currentImageIndex + 1) % product.images.length;
    handleImageChange(next);
  }, [currentImageIndex, product?.images, handleImageChange]);

  const prevImage = useCallback(() => {
    if (!product?.images) return;
    const prev = currentImageIndex === 0 ? product.images.length - 1 : currentImageIndex - 1;
    handleImageChange(prev);
  }, [currentImageIndex, product?.images, handleImageChange]);

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const shareProduct = async () => {
    if (!product) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name || 'Produto',
          text: `Confira ${product?.name || 'este produto'} na VemPraFonte!`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Erro ao compartilhar:', error);
      }
    } else {
      setShowShareModal(true);
    }
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [nextImage, prevImage]);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      const res = await fetch(`/api/products/${slug}`);
      const data = await res.json();
      setProduct(data);
      
      if (data && data.images && data.images.length > 0) {
        preloadImages(data.images);
      }
      
      setLoading(false);
      if (data && data.id) {
        const sug = await fetch(`/api/products/by-model/${data.slug}`);
        const sugData = await sug.json();
        setSuggested((sugData.data || []).filter((p: any) => p.slug !== data.slug).slice(0, 8));
        const sim = await fetch(`/api/products/similar/${data.id}`);
        const simData = await sim.json();
        setSimilar((simData.data || []).slice(0, 8));
      }
    };
    if (slug) fetchProduct();
  }, [slug, preloadImages]);

  function handleCalcularFrete() {
    if (!cep || cep.length < 8) {
      setFreteMsg("Digite um CEP válido.");
      return;
    }
    setFreteMsg("Frete grátis para todo o Brasil! Entrega em até 7 dias úteis");
  }

  if (loading || !product) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 py-8 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Skeleton da imagem */}
            <div className="space-y-6">
              <div className="bg-dark-900/50 rounded-3xl p-6">
                <div className="aspect-square bg-dark-800 rounded-2xl animate-pulse" />
                <div className="flex gap-3 mt-4">
                  {Array(6).fill(0).map((_, i) => (
                    <div key={i} className="w-16 h-16 bg-dark-800 rounded-lg animate-pulse" />
                  ))}
                </div>
              </div>
            </div>
            {/* Skeleton das informações */}
            <div className="space-y-6">
              <div className="bg-dark-900/50 rounded-3xl p-8">
                <div className="h-8 bg-dark-800 rounded mb-6 animate-pulse" />
                <div className="space-y-4">
                  <div className="h-6 bg-dark-800 rounded w-3/4 animate-pulse" />
                  <div className="h-6 bg-dark-800 rounded w-1/2 animate-pulse" />
                  <div className="h-6 bg-dark-800 rounded w-2/3 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const images = product.images || [];
  // Garantir que não há tamanhos duplicados
  const sizes = Array.from(new Set(product.sizes || [])) as string[];
  const care = product.care_instructions || `Evite lavar na máquina para preservar a estrutura.\nLimpe com pano úmido e sabão neutro.\nSeque à sombra para evitar desbotamento.\nGuarde em local arejado.`;

  const discount = product?.originalPrice && product?.price && product.originalPrice > product.price 
    ? ((product.originalPrice - product.price) / product.originalPrice) * 100 
    : 0;

  return (
    <section className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 py-8 md:py-16">
      <div className="container mx-auto px-4">
        {/* Breadcrumbs melhorados */}
        <motion.nav 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-sm text-gray-400 flex items-center gap-2"
        >
          <Link href="/" className="hover:text-primary-400 transition-colors flex items-center gap-1">
            <FontAwesomeIcon icon={faHome} className="w-4 h-4" /> Página inicial
          </Link>
          <span className="text-gray-600">/</span>
          <Link href="/produtos" className="hover:text-primary-400 transition-colors flex items-center gap-1">
            <FontAwesomeIcon icon={faShoePrints} className="w-4 h-4" /> Todos os produtos
          </Link>
          <span className="text-gray-600">/</span>
          <span className="text-white font-semibold truncate max-w-xs">{product?.name || 'Produto'}</span>
        </motion.nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Coluna 1: Galeria de Imagens */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Imagem Principal */}
            <div className="bg-dark-900/50 backdrop-blur-sm rounded-3xl p-6 border border-dark-700/50">
              <div className="relative group">
                {/* Controles de navegação */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-dark-800/80 hover:bg-primary-500 rounded-full flex items-center justify-center text-white transition-all duration-300 opacity-0 group-hover:opacity-100 backdrop-blur-sm"
                    >
                      <ArrowLeft size={20} />
                    </button>
                  <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-dark-800/80 hover:bg-primary-500 rounded-full flex items-center justify-center text-white transition-all duration-300 opacity-0 group-hover:opacity-100 backdrop-blur-sm"
                    >
                      <ArrowRight size={20} />
                  </button>
                  </>
                )}

                {/* Imagem principal com zoom */}
                <div
                  ref={zoomRef}
                  className={`relative w-full aspect-square rounded-2xl overflow-hidden bg-dark-800 border border-dark-700/50 shadow-2xl transition-all duration-300 ${
                    zoomEnabled 
                      ? 'cursor-zoom-in border-primary-500/50 ring-2 ring-primary-500/20' 
                      : 'cursor-pointer hover:border-primary-400/50'
                  }`}
                  onMouseMove={zoomEnabled ? (e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    
                    // Garantir que a posição está dentro dos limites
                    const clampedX = Math.max(0, Math.min(x, rect.width));
                    const clampedY = Math.max(0, Math.min(y, rect.height));
                    
                    setZoomPos({ x: clampedX, y: clampedY });
                  } : undefined}
                  onMouseLeave={() => setZoomPos(null)}
                >
                  {images[selectedImage] && (
                    <Image
                      src={images[selectedImage].url}
                      alt={`${product.name} - Imagem principal`}
                      fill
                      className="object-cover object-top transition-transform duration-300"
                      priority={selectedImage === 0}
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  )}

                  {/* Lupa circular melhorada com animação */}
                  <AnimatePresence>
                  {zoomEnabled && zoomPos && images[selectedImage] && zoomRef.current && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                        className="absolute w-32 h-32 rounded-full border-2 border-primary-500/80 shadow-2xl pointer-events-none z-20 overflow-hidden"
                          style={{
                          left: Math.max(0, Math.min(zoomPos.x - 64, zoomRef.current.offsetWidth - 128)),
                          top: Math.max(0, Math.min(zoomPos.y - 64, zoomRef.current.offsetHeight - 128)),
                            backgroundImage: `url(${images[selectedImage].url})`,
                          backgroundSize: '800% 800%',
                          backgroundPosition: `${(zoomPos.x / zoomRef.current.offsetWidth) * 87.5}% ${(zoomPos.y / zoomRef.current.offsetHeight) * 87.5}%`,
                          backgroundRepeat: 'no-repeat',
                        }}
                      />
                    )}
                  </AnimatePresence>



                  {/* Controles de zoom melhorados */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      onClick={() => setZoomEnabled(!zoomEnabled)}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm ${
                        zoomEnabled 
                          ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' 
                          : 'bg-dark-800/90 text-gray-300 hover:bg-primary-500 hover:text-white hover:shadow-lg hover:shadow-primary-500/30'
                      }`}
                      title={zoomEnabled ? 'Desativar zoom' : 'Ativar zoom'}
                    >
                      {zoomEnabled ? <MagnifyingGlassMinus size={20} /> : <MagnifyingGlass size={20} />}
                    </button>
                  </div>
                </div>

                {/* Instrução de zoom melhorada */}
                <div className="text-center mt-4">
                  <span className="text-xs text-gray-500 flex items-center justify-center gap-2 bg-dark-800/50 px-3 py-2 rounded-full">
                    <MagnifyingGlass size={14} />
                    {zoomEnabled ? 'Zoom ativo • Mova o mouse sobre a imagem' : 'Clique no ícone de lupa para ativar o zoom'}
                    {images.length > 1 && ' • Use as setas para navegar'}
                  </span>
                </div>
              </div>

              {/* Miniaturas */}
              {images.length > 1 && (
                <div className="flex gap-3 mt-6 overflow-x-auto pb-2">
                  {images.map((img: any, idx: number) => (
                    <motion.button
                      key={idx}
                      onClick={() => handleImageChange(idx)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                        selectedImage === idx 
                          ? "border-primary-500 ring-2 ring-primary-500/30" 
                          : "border-dark-700 hover:border-primary-400"
                      }`}
                    >
                      <Image 
                        src={img.url} 
                        alt={`${product.name} - Miniatura ${idx + 1}`} 
                        width={80} 
                        height={80} 
                        className="object-cover w-full h-full" 
                        loading="lazy"
                        sizes="80px"
                      />
                    </motion.button>
                  ))}
                </div>
              )}
            </div>

            {/* Tabs de Informações - Desktop */}
            <div className="hidden lg:block bg-dark-900/50 backdrop-blur-sm rounded-3xl border border-dark-700/50 overflow-hidden">
              <div className="flex border-b border-dark-700">
                {['description', 'care'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-300 ${
                      activeTab === tab
                        ? 'text-primary-400 border-b-2 border-primary-500 bg-primary-500/10'
                        : 'text-gray-400 hover:text-white hover:bg-dark-800/50'
                    }`}
                  >
                    {tab === 'description' && 'Descrição'}
                    {tab === 'care' && 'Cuidados'}
                  </button>
                ))}
              </div>
              
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {activeTab === 'description' && (
                    <motion.div
                      key="description"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="text-gray-300 leading-relaxed"
                    >
                      {product?.description || 'Descrição não disponível.'}
                    </motion.div>
                  )}
                  
                  {activeTab === 'care' && (
                    <motion.div
                      key="care"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-3"
                    >
                      {care.split('\n').map((line: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-3">
                          <span className="text-primary-400 mt-1">•</span>
                          <span className="text-gray-300">{line}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                  

                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Coluna 2: Informações do Produto */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Card Principal */}
            <div className="bg-dark-900/50 backdrop-blur-sm rounded-3xl p-8 border border-dark-700/50 shadow-2xl">
              {/* Header com ações */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2 leading-tight">
                    {product?.name || 'Carregando...'}
                  </h1>
                  {product?.brand && (
                    <span className="inline-block bg-dark-800 text-primary-400 px-3 py-1 rounded-full text-sm font-medium border border-dark-700">
                      {product.brand}
                    </span>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={toggleFavorite}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isFavorite 
                        ? 'bg-red-500 text-white' 
                        : 'bg-dark-800 text-gray-400 hover:bg-dark-700 hover:text-white'
                    }`}
                  >
                    <Heart size={20} weight={isFavorite ? 'fill' : 'regular'} />
                  </button>
                  <button
                    onClick={shareProduct}
                    className="w-12 h-12 bg-dark-800 text-gray-400 hover:bg-primary-500 hover:text-white rounded-full flex items-center justify-center transition-all duration-300"
                  >
                    <Share size={20} />
                  </button>
                </div>
              </div>



              {/* Preços */}
              <div className="mb-8">
                <div className="flex items-baseline gap-3 mb-3">
                  <span className="text-4xl lg:text-5xl font-bold text-primary-400">
                    R$ {product?.price ? product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00'}
                  </span>
                  {product?.originalPrice && product?.price && product.originalPrice > product.price && (
                    <span className="text-xl text-gray-500 line-through">
                      R$ {product.originalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  )}
                </div>
                
                {/* Parcelamento */}
                <div className="text-gray-300 mb-4">
                  <span className="text-lg">
                    ou em até <strong>12x de R$ {product?.price ? (product.price / 12).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00'}</strong>
                  </span>
                </div>

                {/* Desconto */}
                {discount > 0 && (
                  <div className="inline-block bg-primary-500/20 border border-primary-500/30 text-primary-400 px-4 py-2 rounded-full text-sm font-bold">
                    <FontAwesomeIcon icon={faMoneyBillWave} className="mr-2" /> {Math.round(discount)}% de desconto
                  </div>
                )}
              </div>

              {/* Seleção de Tamanho */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold text-white">Tamanho</span>
                  <span className="text-sm text-gray-400">
                    {sizes.length} tamanhos disponíveis
                  </span>
          </div>
                
                {sizes.length > 0 ? (
                  <div className="grid grid-cols-4 gap-3">
                    {sizes.map((size: string) => (
                      <motion.button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`py-3 px-2 rounded-xl border-2 font-bold transition-all duration-300 ${
                          selectedSize === size
                            ? 'border-primary-500 bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                            : 'border-dark-700 text-gray-300 hover:border-primary-400 hover:bg-dark-800'
                        }`}
                      >
                        {size}
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Package size={48} className="mx-auto mb-3 opacity-50" />
                    <p>Nenhum tamanho disponível no momento</p>
                </div>
                )}
              </div>

              {/* Quantidade */}
              <div className="mb-8">
                <span className="block text-lg font-semibold text-white mb-3">Quantidade</span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-dark-800 border border-dark-700 rounded-xl px-3 py-2">
                  <button
                      className="w-8 h-8 rounded-lg bg-dark-700 hover:bg-primary-500 text-white transition-colors flex items-center justify-center"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-bold text-white">{quantity}</span>
                  <button
                      className="w-8 h-8 rounded-lg bg-dark-700 hover:bg-primary-500 text-white transition-colors flex items-center justify-center"
                    onClick={() => setQuantity(q => q + 1)}
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm text-gray-400">
                    {quantity} {quantity === 1 ? 'unidade' : 'unidades'}
                  </span>
                </div>
              </div>

              {/* Botão Adicionar ao Carrinho */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold py-4 px-8 rounded-2xl text-lg shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                  addedToCart ? 'ring-4 ring-green-500/50 bg-green-500' : ''
                }`}
                  disabled={!selectedSize || (product?.stockQuantity === 0)}
                  onClick={handleAddToCart}
                >
                <AnimatePresence mode="wait">
                  {addedToCart ? (
                    <motion.span
                      key="added"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center justify-center gap-2"
                    >
                      <FontAwesomeIcon icon={faCheck} className="text-green-400" /> Adicionado ao carrinho!
                    </motion.span>
                  ) : (
                    <motion.span
                      key="add"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center justify-center gap-2"
                    >
                      Adicionar ao Carrinho
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Informações adicionais */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <Truck size={18} />
                  <span>Frete grátis para todo Brasil</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <Shield size={18} />
                  <span>Garantia de 30 dias</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <Clock size={18} />
                  <span>Entrega em até 7 dias úteis</span>
                </div>
              </div>
            </div>

            {/* Cálculo de Frete */}
            <div className="bg-dark-900/50 backdrop-blur-sm rounded-3xl border border-dark-700/50">
              {/* Desktop Layout */}
              <div className="hidden md:block p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Truck size={20} className="text-primary-400" />
                  Calcular Frete
                </h3>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Digite seu CEP"
                    value={cep}
                    onChange={(e) => setCep(e.target.value.replace(/\D/g, '').slice(0, 8))}
                    className="flex-1 bg-dark-800 border border-dark-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-primary-500 focus:outline-none transition-colors"
                    maxLength={8}
                  />
                  <button
                    onClick={handleCalcularFrete}
                    className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Calcular
                  </button>
                </div>
                {freteMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 p-3 bg-primary-500/20 border border-primary-500/30 rounded-lg text-primary-400 text-sm"
                  >
                    {freteMsg}
                  </motion.div>
                )}
              </div>

              {/* Mobile Layout */}
              <div className="md:hidden p-4">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center justify-center gap-3">
                  <div className="w-10 h-10 bg-primary-500/20 rounded-full flex items-center justify-center">
                    <Truck size={24} className="text-primary-400" />
                  </div>
                  Calcular Frete
                </h3>
                
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Digite seu CEP"
                      value={cep}
                      onChange={(e) => setCep(e.target.value.replace(/\D/g, '').slice(0, 8))}
                      className="w-full bg-dark-800 border-2 border-dark-700 rounded-2xl px-5 py-4 text-white placeholder-gray-400 focus:border-primary-500 focus:outline-none transition-all duration-300 text-center text-lg font-medium"
                      maxLength={8}
                    />
                    <div className="absolute inset-y-0 right-4 flex items-center">
                      <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleCalcularFrete}
                    className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold py-4 px-6 rounded-2xl text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Calcular Frete
                </button>
                </div>

                {freteMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 bg-primary-500/20 border border-primary-500/30 rounded-2xl text-primary-400 text-center"
                  >
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse"></div>
                      <span className="font-semibold">Informação de Frete</span>
                    </div>
                    <p className="text-sm">{freteMsg}</p>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Tabs de Informações - Mobile (dentro do container principal) */}
            <div className="lg:hidden bg-dark-900/50 backdrop-blur-sm rounded-3xl border border-dark-700/50 overflow-hidden mt-6">
              <div className="flex border-b border-dark-700">
                {['description', 'care'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-300 ${
                      activeTab === tab
                        ? 'text-primary-400 border-b-2 border-primary-500 bg-primary-500/10'
                        : 'text-gray-400 hover:text-white hover:bg-dark-800/50'
                    }`}
                  >
                    {tab === 'description' && 'Descrição'}
                    {tab === 'care' && 'Cuidados'}
                  </button>
                ))}
              </div>
              
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {activeTab === 'description' && (
                    <motion.div
                      key="description"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="text-gray-300 leading-relaxed"
                    >
                      {product?.description || 'Descrição não disponível.'}
                    </motion.div>
                  )}
                  
                  {activeTab === 'care' && (
                    <motion.div
                      key="care"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-3"
                    >
                      {care.split('\n').map((line: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-3">
                          <span className="text-primary-400 mt-1">•</span>
                          <span className="text-gray-300">{line}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Produtos Recomendados */}
      {suggested.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-20"
          >
            <div className="container mx-auto">
              <h3 className="text-2xl font-bold text-white mb-8 text-center">
                Produtos Recomendados
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {suggested.map((prod, index) => (
                  <motion.div
                    key={prod.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="h-full"
                  >
                    <Link 
                      href={`/produto/${prod.slug}`} 
                      className="block bg-dark-900/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-dark-700/50 hover:border-primary-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/10 h-full flex flex-col"
                    >
                      <div className="relative aspect-square overflow-hidden bg-dark-800">
                  <Image 
                    src={prod.primary_image || (prod.images && prod.images[0]?.url) || '/images/Logo.png'} 
                    alt={prod.name} 
                    fill 
                          className="object-cover transition-transform duration-300 group-hover:scale-110" 
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    loading="lazy"
                  />
                </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <h4 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-primary-400 transition-colors flex-1">
                          {prod.name}
                        </h4>
                        <span className="text-primary-400 font-bold text-lg">
                          R$ {prod.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
              </Link>
                  </motion.div>
            ))}
          </div>
        </div>
          </motion.div>
      )}

        {/* Produtos Semelhantes */}
      {similar.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-20 mb-8"
          >
            <div className="container mx-auto">
              <h3 className="text-2xl font-bold text-white mb-8 text-center">
                Produtos Semelhantes
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {similar.slice(0, 5).map((prod, index) => (
                  <motion.div
                    key={prod.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="h-full"
                  >
                    <Link 
                      href={`/produto/${prod.slug}`} 
                      className="block bg-dark-900/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-dark-700/50 hover:border-primary-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/10 h-full flex flex-col"
                    >
                      <div className="relative aspect-square overflow-hidden bg-dark-800">
                        <Image 
                          src={prod.primary_image || (prod.images && prod.images[0]?.url) || '/images/Logo.png'} 
                          alt={prod.name} 
                          fill 
                          className="object-cover transition-transform duration-300 group-hover:scale-110" 
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 20vw"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <h4 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-primary-400 transition-colors flex-1">
                          {prod.name}
                        </h4>
                        <span className="text-primary-400 font-bold text-lg">
                          R$ {prod.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                  </div>
                </Link>
                  </motion.div>
                ))}
          </div>
        </div>
          </motion.div>
        )}
      </div>

      {/* Modal de Compartilhamento */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-dark-900 border border-dark-700 rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4">Compartilhar Produto</h3>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    setShowShareModal(false);
                  }}
                  className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 px-4 rounded-xl font-semibold transition-colors"
                >
                  Copiar Link
                </button>
                <button
                  onClick={() => {
                    window.open(`https://wa.me/?text=Confira ${product?.name || 'este produto'} na VemPraFonte! ${window.location.href}`, '_blank');
                    setShowShareModal(false);
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl font-semibold transition-colors"
                >
                  Compartilhar no WhatsApp
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

 