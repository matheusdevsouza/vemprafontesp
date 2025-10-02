"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { 
  FaUpload, 
  FaTrash, 
  FaEye, 
  FaStar, 
  FaVideo, 
  FaImage, 
  FaSpinner,
  FaCheck,
  FaTimes,
  FaDownload,
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaVolumeMute
} from 'react-icons/fa';
import CustomVideoPlayer from '../CustomVideoPlayer';

interface MediaItem {
  id: number;
  url: string;
  fileName: string;
  fileSize?: number;
  mimeType?: string;
  isPrimary?: boolean;
  altText?: string;
  duration?: number;
  thumbnailUrl?: string;
  type: 'image' | 'video';
}

interface MediaManagerProps {
  productId: number;
  onMediaUpdate?: () => void;
}

export default function MediaManager({ productId, onMediaUpdate }: MediaManagerProps) {
  const [images, setImages] = useState<MediaItem[]>([]);
  const [videos, setVideos] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [uploadType, setUploadType] = useState<'image' | 'video'>('image');
  const [altText, setAltText] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRefs = useRef<{ [key: number]: HTMLVideoElement | null }>({});

  // Carregar mídia do produto
  const fetchMedia = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/products/${productId}/media`);
      const result = await response.json();
      
      if (result.success) {
        setImages(result.data.images.map((img: any) => ({
          id: img.id,
          url: img.image_url,
          fileName: img.file_name || 'Nome não disponível',
          fileSize: img.file_size || 0,
          mimeType: img.mime_type || 'image/jpeg',
          isPrimary: Boolean(img.is_primary),
          altText: img.alt_text || img.file_name || 'Imagem do produto',
          type: 'image' as const
        })));
        setVideos(result.data.videos.map((vid: any) => ({
          id: vid.id,
          url: vid.video_url,
          fileName: vid.file_name || 'Nome não disponível',
          fileSize: vid.file_size || 0,
          mimeType: vid.mime_type || 'video/mp4',
          isPrimary: Boolean(vid.is_primary),
          altText: vid.alt_text || vid.file_name || 'Vídeo do produto',
          duration: vid.duration || null,
          thumbnailUrl: vid.thumbnail_url,
          type: 'video' as const
        })));
      } else {
        setError(result.error || 'Erro ao carregar mídia');
      }
    } catch (error) {
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [productId]);

  // Upload de arquivos
  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      setUploadProgress(0);
      setError(null);

      console.log('🔍 Debug upload:', {
        uploadType,
        fileCount: files.length,
        firstFile: files[0]?.name,
        firstFileType: files[0]?.type
      });

      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }
      formData.append('type', uploadType);
      formData.append('altText', altText);
      formData.append('isPrimary', isPrimary.toString());

      const response = await fetch(`/api/admin/products/${productId}/media`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(`${files.length} arquivo(s) enviado(s) com sucesso!`);
        setAltText('');
        setIsPrimary(false);
        await fetchMedia();
        onMediaUpdate?.();
      } else {
        setError(result.error || 'Erro no upload');
      }
    } catch (error) {
      setError('Erro ao conectar com o servidor');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Remover mídia
  const handleDelete = async (mediaId: number, type: 'image' | 'video') => {
    if (!confirm('Tem certeza que deseja remover este arquivo?')) return;

    try {
      const response = await fetch(
        `/api/admin/products/${productId}/media?mediaId=${mediaId}&type=${type}`,
        { method: 'DELETE' }
      );

      const result = await response.json();

      if (result.success) {
        setSuccess('Arquivo removido com sucesso!');
        await fetchMedia();
        onMediaUpdate?.();
      } else {
        setError(result.error || 'Erro ao remover arquivo');
      }
    } catch (error) {
      setError('Erro ao conectar com o servidor');
    }
  };

  // Alternar primário
  const handleTogglePrimary = async (mediaId: number, type: 'image' | 'video') => {
    try {
      const response = await fetch(`/api/admin/products/${productId}/media`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaId, type, isPrimary: true })
      });

      if (response.ok) {
        await fetchMedia();
        onMediaUpdate?.();
      }
    } catch (error) {
      setError('Erro ao atualizar arquivo primário');
    }
  };

  // Formatar tamanho do arquivo
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Formatar duração do vídeo
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Renderizar card de mídia
  const MediaCard = ({ item }: { item: MediaItem }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`relative group bg-dark-800/60 border-2 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/20 ${
        item.isPrimary 
          ? 'border-primary-500/60 shadow-lg shadow-primary-500/20' 
          : 'border-dark-700/60 hover:border-primary-500/40'
      }`}
    >
      {/* Imagem/Vídeo */}
      <div className="relative aspect-square bg-dark-900 overflow-hidden">
        {item.type === 'image' ? (
          <>
            <Image
              src={item.url}
              alt={item.altText || item.fileName}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
            onError={(e) => {
              // Evitar spam no console
              if (!e.currentTarget.dataset.errorLogged) {
                console.warn('Imagem não pôde ser carregada:', item.url);
                e.currentTarget.dataset.errorLogged = 'true';
              }
              e.currentTarget.style.display = 'none';
              // Mostrar fallback
              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
            />
            {/* Fallback quando imagem não carrega */}
            <div className="absolute inset-0 bg-dark-800 flex items-center justify-center" style={{ display: 'none' }}>
              <div className="text-center">
                <FaImage className="text-gray-400 mx-auto mb-2" size={32} />
                <p className="text-gray-400 text-xs">Imagem não encontrada</p>
              </div>
            </div>
          </>
        ) : (
          <div className="relative w-full h-full">
            <CustomVideoPlayer
              src={item.url}
              thumbnail={item.thumbnailUrl}
              alt={item.altText || ''}
              className="w-full h-full"
            />
          </div>
        )}
        
        {/* Badge de tipo */}
        <div className="absolute top-3 left-3">
          <div className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 backdrop-blur-sm ${
            item.type === 'image' 
              ? 'bg-blue-500/90 text-white shadow-lg' 
              : 'bg-red-500/90 text-white shadow-lg'
          }`}>
            {item.type === 'image' ? <FaImage size={12} /> : <FaVideo size={12} />}
            <span className="font-medium">{item.type === 'image' ? 'Imagem' : 'Vídeo'}</span>
          </div>
        </div>

        {/* Badge primário */}
        {item.isPrimary && (
          <div className="absolute top-3 right-3">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-lg backdrop-blur-sm">
              <FaStar size={12} />
              <span className="font-medium">Principal</span>
            </div>
          </div>
        )}

        {/* Overlay de ações */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedMedia(item);
                setShowPreview(true);
              }}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2.5 rounded-full transition-all duration-200 hover:scale-110"
              title="Visualizar"
            >
              <FaEye size={14} />
            </button>
            
            {!item.isPrimary && (
              <button
                onClick={() => handleTogglePrimary(item.id, item.type)}
                className="bg-yellow-500/80 hover:bg-yellow-500 backdrop-blur-sm text-white p-2.5 rounded-full transition-all duration-200 hover:scale-110"
                title="Definir como principal"
              >
                <FaStar size={14} />
              </button>
            )}
            
            <button
              onClick={() => handleDelete(item.id, item.type)}
              className="bg-red-500/80 hover:bg-red-500 backdrop-blur-sm text-white p-2.5 rounded-full transition-all duration-200 hover:scale-110"
              title="Remover"
            >
              <FaTrash size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Informações */}
      <div className="p-4 bg-dark-800/80 backdrop-blur-sm">
        <h4 className="text-white font-medium text-sm truncate mb-2" title={item.fileName}>
          {item.fileName}
        </h4>
        <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
          <span className="bg-dark-700/50 px-2 py-1 rounded-md">
            {item.fileSize ? formatFileSize(item.fileSize) : 'N/A'}
          </span>
          {item.type === 'video' && item.duration && (
            <span className="bg-dark-700/50 px-2 py-1 rounded-md">
              {formatDuration(item.duration)}
            </span>
          )}
        </div>
        {item.altText && (
          <p className="text-xs text-gray-300 truncate" title={item.altText}>
            {item.altText}
          </p>
        )}
      </div>
    </motion.div>
  );

  // Modal de preview
  const PreviewModal = () => (
    <AnimatePresence>
      {showPreview && selectedMedia && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setShowPreview(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="bg-dark-800 rounded-xl overflow-hidden max-w-4xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-dark-700 flex items-center justify-between">
              <h3 className="text-white font-semibold">{selectedMedia.fileName}</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaTimes size={20} />
              </button>
            </div>
            
            <div className="p-4">
              {selectedMedia.type === 'image' ? (
                <Image
                  src={selectedMedia.url}
                  alt={selectedMedia.altText || selectedMedia.fileName}
                  width={800}
                  height={600}
                  className="max-w-full h-auto rounded-lg"
                />
              ) : (
                <CustomVideoPlayer
                  src={selectedMedia.url}
                  thumbnail={selectedMedia.thumbnailUrl}
                  alt={selectedMedia.altText || ''}
                  className="max-w-full h-auto"
                />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-dark-700 border-t-primary-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <FaImage className="text-primary-500 animate-pulse" size={20} />
          </div>
        </div>
        <div className="mt-6 text-center">
          <h3 className="text-white font-medium mb-2">Carregando mídia...</h3>
          <p className="text-gray-400 text-sm">Aguarde enquanto buscamos as imagens e vídeos do produto</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mensagens */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/30 text-red-300 p-4 rounded-lg flex items-center gap-2"
        >
          <FaTimes />
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

      {/* Upload Section */}
      <div className="bg-gradient-to-br from-dark-800/80 to-dark-900/80 border border-dark-700/60 rounded-xl p-6 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary-500/20 rounded-lg">
            <FaUpload className="text-primary-400" size={20} />
          </div>
          <h3 className="text-white font-semibold text-lg">Upload de Mídia</h3>
        </div>
        
        <div className="space-y-6">
          {/* Tipo de mídia */}
          <div className="flex gap-4">
            <label className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all cursor-pointer ${
              uploadType === 'image' 
                ? 'border-primary-500 bg-primary-500/10 text-primary-300' 
                : 'border-dark-700 bg-dark-800/50 text-gray-300 hover:border-dark-600'
            }`}>
              <input
                type="radio"
                name="mediaType"
                value="image"
                checked={uploadType === 'image'}
                onChange={(e) => {
                  console.log('🔄 Mudando para aba:', e.target.value);
                  setUploadType(e.target.value as 'image');
                }}
                className="sr-only"
              />
              <FaImage size={16} />
              <span className="font-medium">Imagens</span>
            </label>
            <label className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all cursor-pointer ${
              uploadType === 'video' 
                ? 'border-primary-500 bg-primary-500/10 text-primary-300' 
                : 'border-dark-700 bg-dark-800/50 text-gray-300 hover:border-dark-600'
            }`}>
              <input
                type="radio"
                name="mediaType"
                value="video"
                checked={uploadType === 'video'}
                onChange={(e) => {
                  console.log('🔄 Mudando para aba:', e.target.value);
                  setUploadType(e.target.value as 'video');
                }}
                className="sr-only"
              />
              <FaVideo size={16} />
              <span className="font-medium">Vídeos</span>
            </label>
          </div>

          {/* Campos de configuração */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2 font-medium">Texto alternativo</label>
              <input
                type="text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Descrição da imagem/vídeo"
                className="w-full bg-dark-900/50 border border-dark-700 rounded-lg p-3 text-white placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20 transition-colors"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-3 text-gray-300 cursor-pointer group">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  isPrimary 
                    ? 'bg-primary-500 border-primary-500' 
                    : 'border-dark-600 group-hover:border-dark-500'
                }`}>
                  {isPrimary && <FaCheck size={12} className="text-white" />}
                </div>
                <input
                  type="checkbox"
                  checked={isPrimary}
                  onChange={(e) => setIsPrimary(e.target.checked)}
                  className="sr-only"
                />
                <span className="font-medium">Definir como principal</span>
              </label>
            </div>
          </div>

          {/* Upload */}
          <div className="border-2 border-dashed border-dark-700 rounded-xl p-8 text-center hover:border-primary-500/50 transition-all duration-300 bg-dark-900/30">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={uploadType === 'image' ? 'image/*' : 'video/*'}
              onChange={(e) => handleUpload(e.target.files)}
              className="hidden"
            />
            
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-primary-500/10 rounded-full">
                {uploadType === 'image' ? (
                  <FaImage className="text-primary-400" size={32} />
                ) : (
                  <FaVideo className="text-primary-400" size={32} />
                )}
              </div>
              
              <div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white rounded-lg disabled:opacity-60 transition-all duration-200 font-medium shadow-lg hover:shadow-primary-500/25"
                >
                  {uploading ? (
                    <>
                      <FaSpinner className="animate-spin" size={16} />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <FaUpload size={16} />
                      Selecionar {uploadType === 'image' ? 'Imagens' : 'Vídeos'}
                    </>
                  )}
                </button>
              </div>
              
              <div className="text-gray-400 text-sm max-w-md">
                <p className="mb-1">
                  {uploadType === 'image' 
                    ? 'Formatos suportados: JPG, PNG, WebP, AVIF'
                    : 'Formatos suportados: MP4, WebM, OGG, AVI, MOV'
                  }
                </p>
                <p className="text-gray-500">Tamanho máximo: 50MB por arquivo</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Imagens */}
      {images.length > 0 && (
        <div className="bg-gradient-to-br from-dark-800/60 to-dark-900/60 border border-dark-700/60 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <FaImage className="text-blue-400" size={20} />
            </div>
            <h3 className="text-white font-semibold text-lg">Imagens do Produto</h3>
            <div className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
              {images.length} {images.length === 1 ? 'imagem' : 'imagens'}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <AnimatePresence>
              {images.map((image) => (
                <MediaCard key={image.id} item={image} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Vídeos */}
      {videos.length > 0 && (
        <div className="bg-gradient-to-br from-dark-800/60 to-dark-900/60 border border-dark-700/60 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <FaVideo className="text-red-400" size={20} />
            </div>
            <h3 className="text-white font-semibold text-lg">Vídeos do Produto</h3>
            <div className="bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-sm font-medium">
              {videos.length} {videos.length === 1 ? 'vídeo' : 'vídeos'}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <AnimatePresence>
              {videos.map((video) => (
                <MediaCard key={video.id} item={video} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Mensagem quando não há mídia */}
      {images.length === 0 && videos.length === 0 && (
        <div className="text-center py-16">
          <div className="bg-dark-800/60 border border-dark-700/60 rounded-xl p-8 max-w-md mx-auto">
            <div className="p-4 bg-gray-600/20 rounded-full w-fit mx-auto mb-6">
              <FaImage className="text-gray-400" size={32} />
            </div>
            <h3 className="text-white font-medium mb-3">Nenhuma mídia encontrada</h3>
            <p className="text-gray-400 mb-6">Este produto ainda não possui imagens ou vídeos.</p>
            <div className="space-y-2 text-sm text-gray-500">
              <p>• Faça upload de imagens para mostrar o produto</p>
              <p>• Adicione vídeos para demonstrações</p>
              <p>• Defina uma imagem principal</p>
            </div>
          </div>
        </div>
      )}

      <PreviewModal />
    </div>
  );
}
