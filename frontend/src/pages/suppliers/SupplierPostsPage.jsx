import React, { useState, useEffect, useCallback, useRef } from 'react';
import Layout from '../../components/Layout';
import { useTheme } from '../../contexts/ThemeContext';
import supplierService from '../../services/supplierService';
import {
  Megaphone,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  Calendar,
  DollarSign,
  User,
  FileText,
  Image as ImageIcon,
  X,
  CheckCircle,
  XCircle,
  Phone,
  Globe,
  ExternalLink
} from 'lucide-react';
import { FaWhatsapp, FaInstagram, FaFacebook } from 'react-icons/fa';

const SupplierPostsPage = () => {
  const { isDarkMode } = useTheme();
  const [posts, setPosts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    supplier_id: '',
    active_only: false
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedPost, setSelectedPost] = useState(null);
  const [formData, setFormData] = useState({
    supplier_id: '',
    title: '',
    description: '',
    services_offered: '',
    image: null,
    price: '',
    contact_info: '',
    instagram: '',
    facebook: '',
    whatsapp: '',
    website: '',
    catalog_url: '',
    is_active: true,
    expires_at: ''
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  const loadPosts = useCallback(async () => {
    try {
      const response = await supplierService.getPosts(filters);
      console.log('Load posts response:', response);
      if (response && (response.success === true || response.status === 'success')) {
        setPosts(response.data || []);
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error('Erro ao carregar publicações:', error);
      setPosts([]);
    }
  }, [filters]);

  const loadSuppliers = async () => {
    try {
      const response = await supplierService.getAll({ status: 'active' });
      if (response && (response.success === true || response.status === 'success')) {
        setSuppliers(response.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar fornecedores:', error);
    }
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([loadPosts(), loadSuppliers()]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar dados das publicações');
    } finally {
      setLoading(false);
    }
  }, [loadPosts]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    loadPosts();
  }, [filters, loadPosts]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleAddPost = () => {
    setSelectedPost(null);
    setModalMode('create');
    setFormData({
      supplier_id: '',
      title: '',
      description: '',
      image: null,
      price: '',
      contact_info: '',
      is_active: true,
      expires_at: ''
    });
    setImagePreview(null);
    setModalOpen(true);
  };

  const handleEditPost = (post) => {
    setSelectedPost(post);
    setModalMode('edit');
    setFormData({
      supplier_id: post.supplier_id,
      title: post.title,
      description: post.description,
      image: null,
      price: post.price || '',
      contact_info: post.contact_info || '',
      is_active: post.is_active,
      expires_at: post.expires_at ? formatDateForInput(post.expires_at) : ''
    });

    // Set preview to existing image if available
    if (post.image_path) {
      setImagePreview(supplierService.getPostImageUrl(post.image_path));
    } else {
      setImagePreview(null);
    }

    setModalOpen(true);
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDeletePost = async (post) => {
    if (!window.confirm(`Tem certeza que deseja excluir a publicação "${post.title}"?`)) {
      return;
    }

    try {
      const response = await supplierService.deletePost(post.id);
      if (response && (response.success === true || response.status === 'success')) {
        setSuccess('Publicação excluída com sucesso');
        await loadPosts();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response?.message || 'Erro ao excluir publicação');
      }
    } catch (error) {
      console.error('Erro ao excluir publicação:', error);
      setError('Erro ao excluir publicação');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file
      const maxSize = 2 * 1024 * 1024; // 2MB
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];

      if (file.size > maxSize) {
        setError('Imagem deve ter no máximo 2MB');
        return;
      }

      if (!allowedTypes.includes(file.type)) {
        setError('Imagem deve ser JPEG, PNG, JPG ou GIF');
        return;
      }

      setFormData(prev => ({ ...prev, image: file }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image: null }));
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    console.log('Form data before validation:', formData);

    // Validate
    const validation = supplierService.validatePostData(formData);
    console.log('Validation result:', validation);

    if (!validation.isValid) {
      setError(validation.errors.join(', '));
      return;
    }

    try {
      let response;
      if (modalMode === 'create') {
        console.log('Creating post with data:', formData);
        response = await supplierService.createPost(formData);
        console.log('Create response:', response);
      } else {
        console.log('Updating post with data:', formData);
        response = await supplierService.updatePost(selectedPost.id, formData);
        console.log('Update response:', response);
      }

      if (response && (response.success === true || response.status === 'success')) {
        setSuccess(modalMode === 'create' ? 'Publicação criada com sucesso' : 'Publicação atualizada com sucesso');
        setModalOpen(false);
        await loadPosts();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response?.message || 'Erro ao salvar publicação');
      }
    } catch (error) {
      console.error('Erro ao salvar publicação:', error);
      setError('Erro ao salvar publicação');
    }
  };

  if (loading) {
    return (
      <Layout title="Publicações de Fornecedores" breadcrumbs={['Dashboard', 'Publicações']}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff6600]"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Publicações de Fornecedores" breadcrumbs={['Dashboard', 'Publicações']}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Publicações de Fornecedores
          </h2>
          <p className={isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-600'}>
            Gerencie anúncios e ofertas dos fornecedores
          </p>
        </div>
        <button
          onClick={handleAddPost}
          className="btn-primary flex items-center space-x-2 bg-[#ff6600] text-white rounded-lg hover:bg-[#ff6600]/80 transition-colors px-4 py-2 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>Nova Publicação</span>
        </button>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
            <span className="text-green-400">{success}</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
            <span className="text-red-400">{error}</span>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className={`card p-6 mb-6 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'} border ${isDarkMode ? 'border-gray-700' : 'border-orange-500'} rounded-xl`}>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#ff6600] w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar publicação..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className={`w-full pl-10 pr-4 py-2 ${isDarkMode ? 'bg-[#080d08]/80 border-[#ff6600]/30 text-white placeholder-[#ff6600]/60' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6600] focus:border-transparent`}
            />
          </div>

          <select
            value={filters.supplier_id}
            onChange={(e) => handleFilterChange('supplier_id', e.target.value)}
            className={`px-4 py-2 ${isDarkMode ? 'bg-[#080d08]/80 border-[#ff6600]/30 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6600] focus:border-transparent`}
          >
            <option value="">Todos os fornecedores</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.company_name}
              </option>
            ))}
          </select>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.active_only}
              onChange={(e) => handleFilterChange('active_only', e.target.checked)}
              className="form-checkbox h-5 w-5 text-[#ff6600] rounded focus:ring-[#ff6600] border-gray-300"
            />
            <span className={isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-700'}>
              Apenas publicações ativas
            </span>
          </label>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Megaphone className="w-16 h-16 text-[#ff6600]/50 mx-auto mb-4" />
            <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
              Nenhuma publicação encontrada
            </h3>
            <p className={`${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-600'} mb-4`}>
              {filters.search || filters.supplier_id
                ? 'Tente ajustar os filtros'
                : 'Comece criando a primeira publicação'}
            </p>
            {!filters.search && !filters.supplier_id && (
              <button
                onClick={handleAddPost}
                className="btn-primary bg-[#ff6600] text-white rounded-lg hover:bg-[#ff6600]/80 transition-colors px-4 py-2 cursor-pointer inline-flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Criar Publicação
              </button>
            )}
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className={`card ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'} border ${isDarkMode ? 'border-gray-700' : 'border-orange-500'} rounded-xl overflow-hidden`}
            >
              {/* Image */}
              {post.image_path ? (
                <img
                  src={supplierService.getPostImageUrl(post.image_path)}
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-[#ff6600]/20 to-[#ff6600]/5 flex items-center justify-center">
                  <ImageIcon className="w-16 h-16 text-[#ff6600]/30" />
                </div>
              )}

              {/* Content */}
              <div className="p-6">
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-3">
                  {post.is_active ? (
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded text-xs font-medium">
                      Ativo
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-500/20 text-gray-400 border border-gray-500/30 rounded text-xs font-medium">
                      Inativo
                    </span>
                  )}

                  {post.is_expired && (
                    <span className="px-2 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded text-xs font-medium">
                      Expirado
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                  {post.title}
                </h3>

                {/* Supplier */}
                <div className={`flex items-center ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-600'} text-sm mb-3`}>
                  <User className="w-4 h-4 mr-1" />
                  {post.supplier?.company_name}
                </div>

                {/* Description */}
                <p className={`${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-600'} text-sm mb-3 line-clamp-2`}>
                  {post.description}
                </p>

                {/* Services Offered */}
                {post.services_offered && (
                  <p className={`${isDarkMode ? 'text-[#ff6600]/80' : 'text-[#ff6600]'} text-sm mb-3 italic`}>
                    {post.services_offered}
                  </p>
                )}

                {/* Price */}
                {post.price && (
                  <div className="flex items-center text-[#ff6600] font-bold text-xl mb-3">
                    <DollarSign className="w-5 h-5" />
                    R$ {parseFloat(post.price).toFixed(2)}
                  </div>
                )}

                {/* Contact Information */}
                <div className={`${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-gray-50'} rounded-lg p-3 mb-3 space-y-2`}>
                  <h4 className={`text-xs font-semibold ${isDarkMode ? 'text-[#ff6600]' : 'text-gray-700'} mb-2`}>
                    Contatos:
                  </h4>

                  {post.contact_info && (
                    <div className={`flex items-center ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-600'} text-sm`}>
                      <Phone className="w-4 h-4 mr-2 text-[#ff6600]" />
                      <span>{post.contact_info}</span>
                    </div>
                  )}

                  {post.whatsapp && (
                    <a
                      href={`https://wa.me/${post.whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-600'} hover:text-green-500 text-sm`}
                    >
                      <FaWhatsapp className="w-4 h-4 mr-2 text-green-500" />
                      <span>{post.whatsapp}</span>
                    </a>
                  )}

                  {post.instagram && (
                    <a
                      href={`https://instagram.com/${post.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-600'} hover:text-pink-500 text-sm`}
                    >
                      <FaInstagram className="w-4 h-4 mr-2 text-pink-500" />
                      <span>@{post.instagram}</span>
                    </a>
                  )}

                  {post.facebook && (
                    <a
                      href={post.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-600'} hover:text-blue-600 text-sm`}
                    >
                      <FaFacebook className="w-4 h-4 mr-2 text-blue-600" />
                      <span className="hover:underline">Facebook</span>
                    </a>
                  )}

                  {post.website && (
                    <a
                      href={post.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-600'} hover:text-[#ff6600] text-sm`}
                    >
                      <Globe className="w-4 h-4 mr-2 text-[#ff6600]" />
                      <span className="hover:underline">Website</span>
                    </a>
                  )}

                  {post.catalog_url && (
                    <a
                      href={post.catalog_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-600'} hover:text-[#ff6600] text-sm`}
                    >
                      <ExternalLink className="w-4 h-4 mr-2 text-[#ff6600]" />
                      <span className="hover:underline">Ver Catálogo</span>
                    </a>
                  )}
                </div>

                {/* Expiry Date */}
                {post.expires_at && (
                  <div className={`flex items-center ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-600'} text-sm mb-3`}>
                    <Calendar className="w-4 h-4 mr-1" />
                    Expira em: {new Date(post.expires_at).toLocaleDateString('pt-BR')}
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-2 pt-4 border-t border-gray-700">
                  <button
                    onClick={() => handleEditPost(post)}
                    className="flex-1 p-2 text-[#ff6600] hover:bg-[#ff6600]/20 rounded-lg transition-colors flex items-center justify-center"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeletePost(post)}
                    className="flex-1 p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors flex items-center justify-center"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
            {/* Modal Header */}
            <div className={`flex justify-between items-center p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {modalMode === 'create' ? 'Nova Publicação' : 'Editar Publicação'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                {/* Supplier */}
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-700'} mb-1`}>
                    Fornecedor *
                  </label>
                  <select
                    name="supplier_id"
                    value={formData.supplier_id}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-2 ${isDarkMode ? 'bg-[#080d08]/80 border-[#ff6600]/30 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6600]`}
                  >
                    <option value="">Selecione um fornecedor</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.company_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-700'} mb-1`}>
                    Título *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-2 ${isDarkMode ? 'bg-[#080d08]/80 border-[#ff6600]/30 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6600]`}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-700'} mb-1`}>
                    Descrição *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className={`w-full px-4 py-2 ${isDarkMode ? 'bg-[#080d08]/80 border-[#ff6600]/30 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6600]`}
                    placeholder="Breve descrição da empresa ou produto"
                  />
                </div>

                {/* Services Offered */}
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-700'} mb-1`}>
                    Serviços Oferecidos
                  </label>
                  <textarea
                    name="services_offered"
                    value={formData.services_offered}
                    onChange={handleInputChange}
                    rows={3}
                    className={`w-full px-4 py-2 ${isDarkMode ? 'bg-[#080d08]/80 border-[#ff6600]/30 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6600]`}
                    placeholder="Ex: Soluções em limpeza & higiene que você precisa para seu condomínio"
                  />
                </div>

                {/* Image */}
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-700'} mb-1`}>
                    Imagem (max 2MB - JPEG, PNG, JPG, GIF)
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,image/gif"
                    onChange={handleImageChange}
                    className={`w-full px-4 py-2 ${isDarkMode ? 'bg-[#080d08]/80 border-[#ff6600]/30 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6600]`}
                  />
                  {imagePreview && (
                    <div className="mt-3 relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Price */}
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-700'} mb-1`}>
                    Preço
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className={`w-full px-4 py-2 ${isDarkMode ? 'bg-[#080d08]/80 border-[#ff6600]/30 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6600]`}
                  />
                </div>

                {/* Contact Info */}
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-700'} mb-1`}>
                    Telefone para Contato
                  </label>
                  <input
                    type="text"
                    name="contact_info"
                    value={formData.contact_info}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 ${isDarkMode ? 'bg-[#080d08]/80 border-[#ff6600]/30 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6600]`}
                    placeholder="Ex: (51) 9998-1599"
                  />
                </div>

                {/* WhatsApp */}
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-700'} mb-1`}>
                    WhatsApp
                  </label>
                  <input
                    type="text"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 ${isDarkMode ? 'bg-[#080d08]/80 border-[#ff6600]/30 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6600]`}
                    placeholder="Ex: (51) 99999-9999"
                  />
                </div>

                {/* Instagram */}
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-700'} mb-1`}>
                    Instagram
                  </label>
                  <input
                    type="text"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 ${isDarkMode ? 'bg-[#080d08]/80 border-[#ff6600]/30 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6600]`}
                    placeholder="Ex: cleanxdistribuidora"
                  />
                </div>

                {/* Facebook */}
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-700'} mb-1`}>
                    Facebook
                  </label>
                  <input
                    type="text"
                    name="facebook"
                    value={formData.facebook}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 ${isDarkMode ? 'bg-[#080d08]/80 border-[#ff6600]/30 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6600]`}
                    placeholder="URL do Facebook"
                  />
                </div>

                {/* Website */}
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-700'} mb-1`}>
                    Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 ${isDarkMode ? 'bg-[#080d08]/80 border-[#ff6600]/30 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6600]`}
                    placeholder="https://www.exemplo.com"
                  />
                </div>

                {/* Catalog URL */}
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-700'} mb-1`}>
                    Link do Catálogo/Folder
                  </label>
                  <input
                    type="url"
                    name="catalog_url"
                    value={formData.catalog_url}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 ${isDarkMode ? 'bg-[#080d08]/80 border-[#ff6600]/30 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6600]`}
                    placeholder="Link para folder de produtos (PDF, Drive, etc.)"
                  />
                </div>

                {/* Expires At */}
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-700'} mb-1`}>
                    Data de Expiração
                  </label>
                  <input
                    type="date"
                    name="expires_at"
                    value={formData.expires_at}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 ${isDarkMode ? 'bg-[#080d08]/80 border-[#ff6600]/30 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6600]`}
                  />
                </div>

                {/* Is Active */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="form-checkbox h-5 w-5 text-[#ff6600] rounded focus:ring-[#ff6600]"
                  />
                  <label className={`text-sm font-medium ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-700'}`}>
                    Publicação Ativa
                  </label>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#ff6600] text-white rounded-lg hover:bg-[#ff6600]/80"
                >
                  {modalMode === 'create' ? 'Criar' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default SupplierPostsPage;
