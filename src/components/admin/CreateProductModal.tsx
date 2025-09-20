'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTimes, 
  FaSave, 
  FaUpload, 
  FaSpinner, 
  FaCheck, 
  FaExclamationTriangle,
  FaImage,
  FaBox,
  FaDollarSign,
  FaStar,
  FaInfoCircle
} from 'react-icons/fa';
import Image from 'next/image';

interface Brand {
  id: number;
  name: string;
}

interface Model {
  id: number;
  name: string;
  image_url?: string;
}

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ProductFormData {
  name: string;
  description: string;
  short_description: string;
  sku: string;
  price: string;
  original_price: string;
  stock_quantity: string;
  min_stock_level: string;
  brand_id: string;
  model_id: string;
}

export default function CreateProductModal({ isOpen, onClose, onSuccess }: CreateProductModalProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Dados para selects
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  
  // Estado do formulário
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    short_description: '',
    sku: '',
    price: '',
    original_price: '',
    stock_quantity: '0',
    min_stock_level: '5',
    brand_id: '',
    model_id: ''
  });

  // Estados para upload de imagens
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState<number | null>(null);

  // Carregar dados iniciais
  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);


  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [brandsRes, modelsRes] = await Promise.all([
        fetch('/api/brands'),
        fetch('/api/models')
      ]);

      const [brandsData, modelsData] = await Promise.all([
        brandsRes.json(),
        modelsRes.json()
      ]);

      if (brandsData.success) setBrands(brandsData.data || []);
      if (modelsData.success) setModels(modelsData.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar dados do formulário');
    } finally {
      setLoading(false);
    }
  };


  const handleInputChange = (field: keyof ProductFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return;

    const newImages: File[] = [];
    const newPreviews: string[] = [];

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        newImages.push(file);
        const preview = URL.createObjectURL(file);
        newPreviews.push(preview);
      }
    });

    setImages(prev => [...prev, ...newImages]);
    setImagePreviews(prev => [...prev, ...newPreviews]);
    
    if (primaryImageIndex === null && newPreviews.length > 0) {
      setPrimaryImageIndex(0);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      const newPreviews = prev.filter((_, i) => i !== index);
      URL.revokeObjectURL(prev[index]);
      return newPreviews;
    });
    
    if (primaryImageIndex === index) {
      setPrimaryImageIndex(newPreviews.length > 0 ? 0 : null);
    } else if (primaryImageIndex !== null && primaryImageIndex > index) {
      setPrimaryImageIndex(primaryImageIndex - 1);
    }
  };

  const setPrimaryImage = (index: number) => {
    setPrimaryImageIndex(index);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) return 'Nome do produto é obrigatório';
    if (!formData.price || parseFloat(formData.price) <= 0) return 'Preço deve ser maior que zero';
    if (!formData.brand_id) return 'Marca é obrigatória';
    if (!formData.model_id) return 'Modelo é obrigatório';
    if (!formData.stock_quantity || parseInt(formData.stock_quantity) < 0) return 'Quantidade em estoque deve ser maior ou igual a zero';
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError(null);

       // Preparar dados do produto
       const productData = {
         ...formData,
         price: parseFloat(formData.price),
         original_price: formData.original_price ? parseFloat(formData.original_price) : null,
         stock_quantity: parseInt(formData.stock_quantity),
         min_stock_level: parseInt(formData.min_stock_level),
         brand_id: parseInt(formData.brand_id),
         model_id: formData.model_id ? parseInt(formData.model_id) : null,
         slug: generateSlug(formData.name),
         is_active: true, // Produto sempre criado como ativo
         is_featured: false // Sempre false por padrão
       };

      // Criar produto
      const productResponse = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });

      const productResult = await productResponse.json();

      if (!productResult.success) {
        throw new Error(productResult.error || 'Erro ao criar produto');
      }

      const productId = productResult.product.id;

      // Upload de imagens se houver
      if (images.length > 0) {
        const formData = new FormData();
        images.forEach((image, index) => {
          formData.append('files', image);
        });
        formData.append('type', 'image');
        formData.append('isPrimary', primaryImageIndex?.toString() || '0');

        const imageResponse = await fetch(`/api/admin/products/${productId}/media`, {
          method: 'POST',
          body: formData
        });

        const imageResult = await imageResponse.json();
        if (!imageResult.success) {
          console.warn('Erro ao fazer upload das imagens:', imageResult.error);
        }
      }

      setSuccess('Produto criado com sucesso!');
      setTimeout(() => {
        onSuccess();
        onClose();
        resetForm();
      }, 1500);

    } catch (error: any) {
      console.error('Erro ao criar produto:', error);
      setError(error.message || 'Erro ao criar produto');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      short_description: '',
      sku: '',
      price: '',
      original_price: '',
      stock_quantity: '0',
      min_stock_level: '5',
      brand_id: '',
      model_id: ''
    });
    setImages([]);
    setImagePreviews([]);
    setPrimaryImageIndex(null);
    setError(null);
    setSuccess(null);
  };

  const handleClose = () => {
    if (!saving) {
      resetForm();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-dark-800 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-dark-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-500/20 rounded-lg">
                <FaBox className="text-primary-400" size={20} />
              </div>
              <h2 className="text-2xl font-bold text-white">Criar Novo Produto</h2>
            </div>
            <button
              onClick={handleClose}
              disabled={saving}
              className="p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            >
              <FaTimes size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              {/* Mensagens */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/10 border border-red-500/30 text-red-300 p-4 rounded-lg flex items-center gap-2"
                >
                  <FaExclamationTriangle />
                  {error}
                </motion.div>
              )}
              
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-500/10 border border-green-500/30 text-green-300 p-4 rounded-lg flex items-center gap-2"
                >
                  <FaCheck />
                  {success}
                </motion.div>
              )}

              {/* Informações Básicas */}
              <div className="bg-dark-700/30 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <FaInfoCircle className="text-primary-400" />
                  Informações Básicas
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nome do Produto *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20 transition-colors"
                      placeholder="Ex: Tênis Nike Air Max 270"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      SKU
                    </label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => handleInputChange('sku', e.target.value)}
                      className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20 transition-colors"
                      placeholder="Ex: NIKE-AM270-001"
                    />
                  </div>


                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Marca *
                    </label>
                    <select
                      value={formData.brand_id}
                      onChange={(e) => handleInputChange('brand_id', e.target.value)}
                      className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20 transition-colors"
                      required
                    >
                      <option value="">Selecione uma marca</option>
                      {brands.map(brand => (
                        <option key={brand.id} value={brand.id}>{brand.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Modelo *
                    </label>
                    <select
                      value={formData.model_id}
                      onChange={(e) => handleInputChange('model_id', e.target.value)}
                      className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20 transition-colors"
                      required
                    >
                      <option value="">Selecione um modelo</option>
                      {models.map(model => (
                        <option key={model.id} value={model.id}>{model.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Preços e Estoque */}
              <div className="bg-dark-700/30 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <FaDollarSign className="text-primary-400" />
                  Preços e Estoque
                </h3>
                
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                     <label className="block text-sm font-medium text-gray-300 mb-2">
                       Preço de Venda *
                     </label>
                     <div className="relative">
                       <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">R$</span>
                       <input
                         type="number"
                         step="0.01"
                         min="0"
                         value={formData.price}
                         onChange={(e) => handleInputChange('price', e.target.value)}
                         className="w-full bg-dark-800 border border-dark-600 rounded-lg pl-8 pr-4 py-3 text-white placeholder-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20 transition-colors"
                         placeholder="0,00"
                         required
                       />
                     </div>
                   </div>

                   <div>
                     <label className="block text-sm font-medium text-gray-300 mb-2">
                       Preço Original
                     </label>
                     <div className="relative">
                       <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">R$</span>
                       <input
                         type="number"
                         step="0.01"
                         min="0"
                         value={formData.original_price}
                         onChange={(e) => handleInputChange('original_price', e.target.value)}
                         className="w-full bg-dark-800 border border-dark-600 rounded-lg pl-8 pr-4 py-3 text-white placeholder-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20 transition-colors"
                         placeholder="0,00"
                       />
                     </div>
                   </div>

                   <div>
                     <label className="block text-sm font-medium text-gray-300 mb-2">
                       Quantidade em Estoque *
                     </label>
                     <input
                       type="number"
                       min="0"
                       value={formData.stock_quantity}
                       onChange={(e) => handleInputChange('stock_quantity', e.target.value)}
                       className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20 transition-colors"
                       placeholder="0"
                       required
                     />
                   </div>

                   <div>
                     <label className="block text-sm font-medium text-gray-300 mb-2">
                       Estoque Mínimo
                     </label>
                     <input
                       type="number"
                       min="0"
                       value={formData.min_stock_level}
                       onChange={(e) => handleInputChange('min_stock_level', e.target.value)}
                       className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20 transition-colors"
                       placeholder="5"
                     />
                   </div>
                 </div>
              </div>


              {/* Descrições */}
              <div className="bg-dark-700/30 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <FaInfoCircle className="text-primary-400" />
                  Descrições
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Descrição Curta
                    </label>
                    <textarea
                      value={formData.short_description}
                      onChange={(e) => handleInputChange('short_description', e.target.value)}
                      rows={2}
                      className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20 transition-colors resize-none"
                      placeholder="Breve descrição do produto (máx. 500 caracteres)"
                      maxLength={500}
                    />
                    <div className="text-right text-xs text-gray-400 mt-1">
                      {formData.short_description.length}/500
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Descrição Completa
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                      className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20 transition-colors resize-none"
                      placeholder="Descrição detalhada do produto"
                    />
                  </div>

                </div>
              </div>


              {/* Upload de Imagens */}
              <div className="bg-dark-700/30 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <FaImage className="text-primary-400" />
                  Imagens do Produto
                </h3>
                
                <div className="space-y-6">
                  {/* Upload */}
                  <div className="border-2 border-dashed border-dark-600 rounded-xl p-8 text-center hover:border-primary-500/50 transition-all duration-300">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e.target.files)}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer flex flex-col items-center gap-4"
                    >
                      <div className="p-4 bg-primary-500/10 rounded-full">
                        <FaUpload className="text-primary-400" size={32} />
                      </div>
                      <div>
                        <p className="text-white font-medium mb-2">Clique para selecionar imagens</p>
                        <p className="text-gray-400 text-sm">Formatos: JPG, PNG, WebP, AVIF (máx. 50MB cada)</p>
                      </div>
                    </label>
                  </div>

                  {/* Preview das imagens */}
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div
                          key={index}
                          className={`relative group bg-dark-800 rounded-lg overflow-hidden border-2 ${
                            primaryImageIndex === index 
                              ? 'border-primary-500 shadow-lg shadow-primary-500/20' 
                              : 'border-dark-600'
                          }`}
                        >
                          <Image
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            width={200}
                            height={200}
                            className="w-full h-32 object-cover"
                          />
                          
                          {/* Overlay de ações */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => setPrimaryImage(index)}
                              className={`p-2 rounded-full transition-colors ${
                                primaryImageIndex === index
                                  ? 'bg-primary-500 text-white'
                                  : 'bg-white/20 text-white hover:bg-white/30'
                              }`}
                              title="Definir como principal"
                            >
                              <FaStar size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="p-2 bg-red-500/80 text-white rounded-full hover:bg-red-500 transition-colors"
                              title="Remover imagem"
                            >
                              <FaTimes size={14} />
                            </button>
                          </div>

                          {/* Badge de principal */}
                          {primaryImageIndex === index && (
                            <div className="absolute top-2 right-2 bg-primary-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                              Principal
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>


              {/* Botões */}
              <div className="flex items-center justify-end gap-4 pt-6 border-t border-dark-700">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={saving}
                  className="px-6 py-3 text-gray-300 hover:text-white transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || loading}
                  className="px-8 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-lg font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <FaSpinner className="animate-spin" size={16} />
                      Criando Produto...
                    </>
                  ) : (
                    <>
                      <FaSave size={16} />
                      Criar Produto
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
