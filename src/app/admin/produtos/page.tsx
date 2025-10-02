'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  FaBox, 
  FaSearch, 
  FaFilter, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaTags,
  FaStar,
  FaSpinner,
  FaExclamationTriangle,
  FaBars,
  FaTimes,
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa';
import Link from 'next/link'
import CreateProductModal from '@/components/admin/CreateProductModal'

interface Product {
  id: number;
  name: string;
  brand_name?: string; // Nome da marca direto
  category_name?: string; // Nome da categoria direto
  model_name?: string; // Nome do modelo direto
  primary_image?: string; // Imagem principal direta
  price: number;
  stock_quantity: number;
  is_active: boolean;
  sku: string;
  created_at?: string;
  // Manter compatibilidade com estrutura antiga
  brands?: {
    name: string;
  };
  category?: {
    name: string;
  };
  product_images?: Array<{
    image_url: string;
    is_primary: boolean;
  }>;
}

interface Model {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  is_active?: boolean;
}

interface Brand {
  id: number;
  name: string;
}

// Funções auxiliares para obter dados do produto
const getProductBrand = (product: Product): string => {
  return product.brand_name || getProductBrand(product);
};

const getProductImage = (product: Product): string | null => {
  if (product.primary_image) {
    return product.primary_image;
  }
  if (product.product_images && product.product_images.length > 0) {
    const primaryImg = product.product_images.find(img => img.is_primary);
    return primaryImg?.image_url || product.product_images[0].image_url;
  }
  return null;
};

export default function ProdutosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedModel, setSelectedModel] = useState('all');
  const [newProducts, setNewProducts] = useState(false);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Estados para responsividade
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: searchTerm,
        brand: selectedBrand,
        model: selectedModel,
        newProducts: newProducts.toString(),
        sortBy,
        sortOrder
      });

      const response = await fetch(`/api/admin/products?${params}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        setProducts(result.data.products || []);
        setTotalPages(result.data.pagination?.pages || 1);
        setTotalProducts(result.data.pagination?.total || 0);
      } else {
        setError(result.error || 'Erro ao carregar produtos');
        setProducts([]);
      }
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      setError('Erro ao conectar com o servidor');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, selectedBrand, selectedModel, newProducts, sortBy, sortOrder]);


  const fetchBrands = useCallback(async () => {
    try {
      const response = await fetch('/api/brands');
      const result = await response.json();
      
      if (result.success && result.data) {
        setBrands(result.data || []);
      }
    } catch (error) {
      console.error('Erro ao buscar marcas:', error);
    }
  }, []);

  const fetchModels = useCallback(async () => {
    try {
      const response = await fetch('/api/models');
      const result = await response.json();
      
      if (result.success && result.data) {
        setModels(result.data || []);
      }
    } catch (error) {
      console.error('Erro ao buscar modelos:', error);
    }
  }, []);

  // Hook para detectar tamanho da tela
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      
      // Auto-ajustar modo de visualização baseado no tamanho
      if (width < 768) {
        // Mobile: sempre grid
        setViewMode('grid');
      } else if (width >= 768 && width < 1024) {
        // Tablet: preferir table, mas permitir alternar
        if (viewMode === 'grid' && width >= 768) {
          // Se estava em grid e redimensionou para tablet, manter table
          setViewMode('table');
        }
      } else {
        // Desktop/Notebook: sempre table
        setViewMode('table');
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [viewMode]);

  useEffect(() => {
    fetchProducts();
    fetchBrands();
    fetchModels();
  }, [fetchProducts, fetchBrands, fetchModels]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return <FaSort className="text-gray-400" />;
    return sortOrder === 'asc' ? <FaSortUp className="text-primary-500" /> : <FaSortDown className="text-primary-500" />;
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('Tem certeza que deseja remover este produto? Esta ação não pode ser desfeita.')) return;

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Recarregar produtos
        fetchProducts();
      } else {
        alert('Erro ao remover produto: ' + result.error);
      }
    } catch (error) {
      console.error('Erro ao remover produto:', error);
      alert('Erro ao conectar com o servidor');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedBrand('all');
    setSelectedModel('all');
    setNewProducts(false);
    setSortBy('created_at');
    setSortOrder('desc');
    setPage(1);
  };

  // Componente para card de produto
  const ProductCard = ({ product }: { product: Product }) => (
    <motion.div
      variants={itemVariants}
      className="bg-dark-800/50 backdrop-blur-sm border border-dark-700/50 rounded-2xl p-4 hover:bg-dark-700/30 transition-all duration-300"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-16 h-16 rounded-xl overflow-hidden bg-dark-700/50 flex-shrink-0">
          {getProductImage(product) ? (
            <Image
              src={getProductImage(product)!}
              alt={product.name}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-dark-600/50 flex items-center justify-center">
              <FaBox className="text-gray-400" size={24} />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-sm mb-1 truncate">{product.name}</h3>
          <div className="flex items-center gap-2 mb-2">
            <FaTags className="text-primary-500" size={12} />
            <span className="text-gray-400 text-xs">{getProductBrand(product)}</span>
          </div>
          <div className="text-primary-400 font-bold text-lg">
            R$ {product.price?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            (product.stock_quantity || 0) > 20 ? 'bg-green-500' :
            (product.stock_quantity || 0) > 10 ? 'bg-yellow-500' : 'bg-red-500'
          }`}></div>
          <span className={`text-xs font-medium ${
            (product.stock_quantity || 0) > 20 ? 'text-green-400' :
            (product.stock_quantity || 0) > 10 ? 'text-yellow-400' : 'text-red-400'
          }`}>
            Estoque: {product.stock_quantity || 0}
          </span>
        </div>
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          product.is_active 
            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
            : 'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}>
          {product.is_active ? 'Ativo' : 'Inativo'}
        </span>
      </div>
      
      <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
        <span>ID: {product.id}</span>
        {product.sku && <span>SKU: {product.sku}</span>}
      </div>
      
      <div className="flex items-center gap-2">
        <Link 
          href={`/admin/produtos/${product.id}`} 
          className="flex-1 bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 hover:text-primary-300 px-3 py-2 rounded-lg transition-all duration-300 text-center text-sm font-medium flex items-center justify-center gap-1"
        >
          <FaEye size={16} />
          Ver
        </Link>
        <Link 
          href={`/admin/produtos/${product.id}`} 
          className="flex-1 bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 hover:text-primary-300 px-3 py-2 rounded-lg transition-all duration-300 text-center text-sm font-medium flex items-center justify-center gap-1"
        >
          <FaEdit size={16} />
          Editar
        </Link>
        <button 
          onClick={() => handleDeleteProduct(product.id)}
          className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 px-3 py-2 rounded-lg transition-all duration-300 text-center text-sm font-medium flex items-center justify-center gap-1"
        >
          <FaTrash size={16} />
          Excluir
        </button>
      </div>
    </motion.div>
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading && products.length === 0) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="h-12 bg-gray-700 rounded mb-6"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
          <FaExclamationTriangle className="mx-auto text-red-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-red-300 mb-2">Erro ao carregar produtos</h3>
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchProducts}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-300"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Gerenciar Produtos</h1>
          <p className="text-gray-400 text-sm md:text-base">Gerencie o catálogo de produtos da sua loja</p>
        </div>
        
        {/* Controles do Header */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Toggle de Visualização (apenas em tablets e desktops) */}
          {!isMobile && (
            <div className="flex bg-dark-800/50 rounded-xl p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-1 ${
                  viewMode === 'table' 
                    ? 'bg-primary-500 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <FaBars size={12} />
                <span className="hidden md:inline">Tabela</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-1 ${
                  viewMode === 'grid' 
                    ? 'bg-primary-500 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <FaBox size={12} />
                <span className="hidden md:inline">Cards</span>
              </button>
            </div>
          )}
          
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-4 lg:px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/25 flex items-center justify-center gap-2 text-sm lg:text-base whitespace-nowrap"
          >
            <FaPlus size={16} />
            <span className="hidden sm:inline">Adicionar Produto</span>
            <span className="sm:hidden">Adicionar</span>
          </button>
        </div>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-dark-800/50 backdrop-blur-sm border border-dark-700/50 rounded-2xl p-4 md:p-6"
      >
        {/* Mobile Filter Toggle */}
        {isMobile && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FaFilter className="text-primary-500" size={16} />
              <span className="text-white font-medium">Filtros</span>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 text-gray-400 hover:text-white transition-colors duration-300"
            >
              {showFilters ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />}
            </button>
          </div>
        )}

        {/* Filter Content */}
        <div className={`${isMobile && !showFilters ? 'hidden' : ''} space-y-4`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative md:col-span-2 lg:col-span-1">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Pesquisar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-dark-700/50 border border-dark-600/50 rounded-xl px-4 py-3 pl-10 text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:bg-dark-700 transition-all duration-300 text-sm lg:text-base"
              />
            </div>

            {/* Brand Filter */}
            <div className="relative">
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full bg-dark-700/50 border border-dark-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 focus:bg-dark-700 transition-all duration-300 text-sm lg:text-base appearance-none"
              >
                <option value="all">Todas as Marcas</option>
                {brands && brands.length > 0 && brands.map(brand => (
                  <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
              </select>
              <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
            </div>

            {/* Model Filter */}
            <div className="relative">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-dark-700/50 border border-dark-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 focus:bg-dark-700 transition-all duration-300 text-sm lg:text-base appearance-none"
              >
                <option value="all">Todos os Modelos</option>
                {models && models.length > 0 && models.map(model => (
                  <option key={model.id} value={model.id}>{model.name}</option>
                ))}
              </select>
              <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
            </div>

            {/* Product Age Filter */}
            <div className="flex items-center">
              <button
                onClick={() => setNewProducts(!newProducts)}
                className={`w-full px-4 py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm lg:text-base ${
                  newProducts 
                    ? 'bg-primary-500 text-white border border-primary-500' 
                    : 'bg-dark-700/50 hover:bg-dark-700 border border-dark-600/50 hover:border-dark-500/50 text-gray-300 hover:text-white'
                }`}
              >
                <FaStar size={16} />
                <span className="hidden sm:inline">Produtos Novos</span>
                <span className="sm:hidden">Novos</span>
              </button>
            </div>

            {/* Clear Filters */}
            <div className="flex items-center">
              <button
                onClick={clearFilters}
                className="w-full bg-dark-700/50 hover:bg-dark-700 border border-dark-600/50 hover:border-dark-500/50 text-gray-300 hover:text-white px-4 py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm lg:text-base"
              >
                <FaFilter size={16} />
                <span className="hidden sm:inline">Limpar Filtros</span>
                <span className="sm:hidden">Limpar</span>
              </button>
            </div>
          </div>

          {/* Mobile Stats */}
          {isMobile && (
            <div className="bg-dark-700/30 rounded-xl p-3">
              <div className="text-center text-gray-400 text-sm">
                Mostrando {products.length} de {totalProducts} produtos
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Products Display */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-dark-800/50 backdrop-blur-sm border border-dark-700/50 rounded-2xl overflow-hidden"
      >
        {viewMode === 'table' ? (
          /* Table View */
          <div className="overflow-x-auto max-w-full">
            <table className="w-full min-w-max">
              <thead className="bg-dark-700/50 border-b border-dark-600/50">
                <tr>
                  <th className="px-2 lg:px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors duration-300 font-semibold text-xs lg:text-sm"
                    >
                      Produto
                      {getSortIcon('name')}
                    </button>
                  </th>
                  <th className="px-2 lg:px-4 py-3 text-left hidden md:table-cell">
                    <button
                      onClick={() => handleSort('brand')}
                      className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors duration-300 font-semibold text-xs lg:text-sm"
                    >
                      Marca
                      {getSortIcon('brand')}
                    </button>
                  </th>
                  <th className="px-2 lg:px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('price')}
                      className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors duration-300 font-semibold text-xs lg:text-sm"
                    >
                      Preço
                      {getSortIcon('price')}
                    </button>
                  </th>
                  <th className="px-2 lg:px-4 py-3 text-left hidden md:table-cell">
                    <button
                      onClick={() => handleSort('stock')}
                      className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors duration-300 font-semibold text-xs lg:text-sm"
                    >
                      Estoque
                      {getSortIcon('stock')}
                    </button>
                  </th>
                  <th className="px-2 lg:px-4 py-3 text-left hidden lg:table-cell">
                    <button
                      onClick={() => handleSort('status')}
                      className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors duration-300 font-semibold text-xs lg:text-sm"
                    >
                      Status
                      {getSortIcon('status')}
                    </button>
                  </th>
                  <th className="px-2 lg:px-4 py-3 text-center text-xs lg:text-sm">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-600/30">
                {products && products.length > 0 ? products.map((product, index) => (
                  <motion.tr
                    key={product.id}
                    variants={itemVariants}
                    className="hover:bg-dark-700/30 transition-colors duration-300"
                  >
                    <td className="px-2 lg:px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg overflow-hidden bg-dark-700/50 flex-shrink-0">
                          {getProductImage(product) ? (
                            <Image
                              src={getProductImage(product)!}
                              alt={product.name}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-dark-600/50 flex items-center justify-center">
                              <FaBox className="text-gray-400" size={14} />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-white font-medium text-xs lg:text-sm truncate">{product.name}</div>
                          <div className="text-gray-400 text-xs">ID: {product.id}</div>
                          {product.sku && (
                            <div className="text-gray-400 text-xs">SKU: {product.sku}</div>
                          )}
                          {/* Marca visível em mobile */}
                          <div className="md:hidden flex items-center gap-1 mt-1">
                            <FaTags className="text-primary-500" size={8} />
                            <span className="text-gray-400 text-xs">{getProductBrand(product)}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 lg:px-4 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-1">
                        <FaTags className="text-primary-500" size={12} />
                        <span className="text-white text-xs lg:text-sm">{getProductBrand(product)}</span>
                      </div>
                    </td>
                    <td className="px-2 lg:px-4 py-3">
                      <span className="text-white font-semibold text-xs lg:text-sm">
                        R$ {product.price?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                      </span>
                    </td>
                    <td className="px-2 lg:px-4 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${
                          (product.stock_quantity || 0) > 20 ? 'bg-green-500' :
                          (product.stock_quantity || 0) > 10 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                        <span className={`font-medium text-xs lg:text-sm ${
                          (product.stock_quantity || 0) > 20 ? 'text-green-400' :
                          (product.stock_quantity || 0) > 10 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {product.stock_quantity || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-2 lg:px-4 py-3 hidden lg:table-cell">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        product.is_active 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {product.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-2 lg:px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <Link href={`/admin/produtos/${product.id}`} className="p-1 text-primary-400 hover:text-primary-300 hover:bg-primary-500/10 rounded-lg transition-all duration-300">
                          <FaEye size={16} />
                        </Link>
                        <Link href={`/admin/produtos/${product.id}`} className="p-1 text-primary-400 hover:text-primary-300 hover:bg-primary-500/10 rounded-lg transition-all duration-300">
                          <FaEdit size={16} />
                        </Link>
                        <button 
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-300"
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-gray-400">
                        <FaBox className="mx-auto mb-4" size={48} />
                        <h3 className="text-lg font-medium text-gray-300 mb-2">Nenhum produto encontrado</h3>
                        <p className="text-gray-500">Tente ajustar os filtros ou adicionar novos produtos.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* Grid View */
          <div className="p-4 lg:p-6">
            {products && products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400">
                  <FaBox className="mx-auto mb-4" size={48} />
                  <h3 className="text-lg font-medium text-gray-300 mb-2">Nenhum produto encontrado</h3>
                  <p className="text-gray-500">Tente ajustar os filtros ou adicionar novos produtos.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && products.length > 0 && (
          <div className="flex items-center justify-center py-8">
            <FaSpinner className="animate-spin text-primary-500 mr-2" size={20} />
            <span className="text-gray-400">Carregando...</span>
          </div>
        )}
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-dark-800/50 backdrop-blur-sm border border-dark-700/50 rounded-2xl p-4 lg:p-6"
        >
          <div className="text-gray-400 text-sm text-center md:text-left">
            Mostrando {products.length} de {totalProducts} produtos
          </div>
          
          <div className="flex items-center justify-center gap-2">
            <button 
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-2 text-gray-400 hover:text-white hover:bg-dark-700/50 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm lg:text-base"
            >
              <span className="hidden md:inline">Anterior</span>
              <span className="md:hidden">‹</span>
            </button>
            
            <div className="flex items-center gap-1">
              {/* Páginas visíveis baseadas no tamanho da tela */}
              {(() => {
                const maxVisible = isMobile ? 3 : 5;
                const startPage = Math.max(1, page - Math.floor(maxVisible / 2));
                const endPage = Math.min(totalPages, startPage + maxVisible - 1);
                const actualStartPage = Math.max(1, endPage - maxVisible + 1);
                
                const pages = [];
                
                // Primeira página se não estiver visível
                if (actualStartPage > 1) {
                  pages.push(
                    <button
                      key={1}
                      onClick={() => setPage(1)}
                      className="px-2 md:px-3 py-2 rounded-lg transition-all duration-300 text-gray-400 hover:text-white hover:bg-dark-700/50 text-sm md:text-base"
                    >
                      1
                    </button>
                  );
                  if (actualStartPage > 2) {
                    pages.push(
                      <span key="ellipsis1" className="px-2 text-gray-500 text-sm md:text-base">...</span>
                    );
                  }
                }
                
                // Páginas visíveis
                for (let i = actualStartPage; i <= endPage; i++) {
                  pages.push(
                    <button
                      key={i}
                      onClick={() => setPage(i)}
                      className={`px-2 md:px-3 py-2 rounded-lg transition-all duration-300 text-sm md:text-base ${
                        i === page 
                          ? 'bg-primary-500 text-white' 
                          : 'text-gray-400 hover:text-white hover:bg-dark-700/50'
                      }`}
                    >
                      {i}
                    </button>
                  );
                }
                
                // Última página se não estiver visível
                if (endPage < totalPages) {
                  if (endPage < totalPages - 1) {
                    pages.push(
                      <span key="ellipsis2" className="px-2 text-gray-500 text-sm md:text-base">...</span>
                    );
                  }
                  pages.push(
                    <button
                      key={totalPages}
                      onClick={() => setPage(totalPages)}
                      className="px-2 md:px-3 py-2 rounded-lg transition-all duration-300 text-gray-400 hover:text-white hover:bg-dark-700/50 text-sm md:text-base"
                    >
                      {totalPages}
                    </button>
                  );
                }
                
                return pages;
              })()}
            </div>
            
            <button 
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-3 py-2 text-gray-400 hover:text-white hover:bg-dark-700/50 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm lg:text-base"
            >
              <span className="hidden md:inline">Próximo</span>
              <span className="md:hidden">›</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Modal de Criação de Produto */}
      <CreateProductModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          fetchProducts();
          setShowCreateModal(false);
        }}
      />
    </div>
  );
}
