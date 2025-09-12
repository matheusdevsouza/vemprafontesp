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
  FaExclamationTriangle
} from 'react-icons/fa';
import Link from 'next/link'

interface Product {
  id: number;
  name: string;
  brands: {
    name: string;
  };
  category: {
    name: string;
  };
  price: number;
  stock_quantity: number;
  is_active: boolean;
  sku: string;
  product_images: Array<{
    image_url: string;
    is_primary: boolean;
  }>;
}

interface Category {
  id: number;
  name: string;
}

interface Brand {
  id: number;
  name: string;
}

export default function ProdutosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: searchTerm,
        category: selectedCategory,
        brand: selectedBrand,
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
  }, [page, searchTerm, selectedCategory, selectedBrand, sortBy, sortOrder]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/categories');
      const result = await response.json();
      
      if (result.success && result.data) {
        setCategories(result.data || []);
      }
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
    }
  }, []);

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

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchBrands();
  }, [fetchProducts, fetchCategories, fetchBrands]);

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
    if (!confirm('Tem certeza que deseja remover este produto?')) return;

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
    setSelectedCategory('all');
    setSelectedBrand('all');
    setPage(1);
  };

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
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Gerenciar Produtos</h1>
          <p className="text-gray-400">Gerencie o catálogo de produtos da sua loja</p>
        </div>
        <button className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/25 flex items-center gap-2">
          <FaPlus size={16} />
          Adicionar Produto
        </button>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-dark-800/50 backdrop-blur-sm border border-dark-700/50 rounded-2xl p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Pesquisar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-dark-700/50 border border-dark-600/50 rounded-xl px-4 py-3 pl-10 text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:bg-dark-700 transition-all duration-300"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-dark-700/50 border border-dark-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 focus:bg-dark-700 transition-all duration-300"
          >
            <option value="all">Todas as Categorias</option>
            {categories && categories.length > 0 && categories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>

          {/* Brand Filter */}
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="bg-dark-700/50 border border-dark-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 focus:bg-dark-700 transition-all duration-300"
          >
            <option value="all">Todas as Marcas</option>
            {brands && brands.length > 0 && brands.map(brand => (
              <option key={brand.id} value={brand.id}>{brand.name}</option>
            ))}
          </select>

          {/* Clear Filters */}
          <button
            onClick={clearFilters}
            className="bg-dark-700/50 hover:bg-dark-700 border border-dark-600/50 hover:border-dark-500/50 text-gray-300 hover:text-white px-4 py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
          >
            <FaFilter size={16} />
            Limpar Filtros
          </button>
        </div>
      </motion.div>

      {/* Products Table */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-dark-800/50 backdrop-blur-sm border border-dark-700/50 rounded-2xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-700/50 border-b border-dark-600/50">
              <tr>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors duration-300 font-semibold"
                  >
                    Produto
                    {getSortIcon('name')}
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort('brand')}
                    className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors duration-300 font-semibold"
                  >
                    Marca
                    {getSortIcon('brand')}
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort('category')}
                    className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors duration-300 font-semibold"
                  >
                    Categoria
                    {getSortIcon('category')}
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort('price')}
                    className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors duration-300 font-semibold"
                  >
                    Preço
                    {getSortIcon('price')}
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort('stock')}
                    className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors duration-300 font-semibold"
                  >
                    Estoque
                    {getSortIcon('stock')}
                  </button>
                </th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-600/30">
              {products && products.length > 0 ? products.map((product, index) => (
                <motion.tr
                  key={product.id}
                  variants={itemVariants}
                  className="hover:bg-dark-700/30 transition-colors duration-300"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-dark-700/50 flex-shrink-0">
                        {product.product_images && product.product_images.length > 0 ? (
                          <Image
                            src={product.product_images.find(img => img.is_primary)?.image_url || product.product_images[0].image_url}
                            alt={product.name}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-dark-600/50 flex items-center justify-center">
                            <FaBox className="text-gray-400" size={20} />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-white font-medium">{product.name}</div>
                        <div className="text-gray-400 text-sm">ID: {product.id}</div>
                        {product.sku && (
                          <div className="text-gray-400 text-xs">SKU: {product.sku}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <FaTags className="text-primary-500" size={14} />
                      <span className="text-white">{product.brands?.name || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-dark-700/50 text-gray-300 border border-dark-600/50">
                      {product.category?.name || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-white font-semibold">
                      R$ {product.price?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        (product.stock_quantity || 0) > 20 ? 'bg-green-500' :
                        (product.stock_quantity || 0) > 10 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <span className={`font-medium ${
                        (product.stock_quantity || 0) > 20 ? 'text-green-400' :
                        (product.stock_quantity || 0) > 10 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {product.stock_quantity || 0}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      product.is_active 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {product.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <Link href={`/admin/produtos/${product.id}`} className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-all duration-300">
                        <FaEye size={16} />
                      </Link>
                      <Link href={`/admin/produtos/${product.id}`} className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded-lg transition-all duration-300">
                        <FaEdit size={16} />
                      </Link>
                      <button 
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-300"
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
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
          className="flex items-center justify-between bg-dark-800/50 backdrop-blur-sm border border-dark-700/50 rounded-2xl p-4"
        >
          <div className="text-gray-400 text-sm">
            Mostrando {products.length} de {totalProducts} produtos
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-2 text-gray-400 hover:text-white hover:bg-dark-700/50 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-3 py-2 rounded-lg transition-all duration-300 ${
                      pageNum === page 
                        ? 'bg-primary-500 text-white' 
                        : 'text-gray-400 hover:text-white hover:bg-dark-700/50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button 
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-3 py-2 text-gray-400 hover:text-white hover:bg-dark-700/50 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próximo
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
