import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, Send, Archive, FileText, AlertCircle } from 'lucide-react';
import Layout from '../../components/Layout';
import Pagination from '../../components/Pagination';
import AnnouncementModal from '../../components/modals/AnnouncementModal';
import announcementService from '../../services/announcementService';
import { useStructure } from '../../contexts/StructureContext';
import { useTheme } from '../../contexts/ThemeContext';

const AnnouncementsPage = () => {
  const { condominiums } = useStructure();
  const { isDarkMode } = useTheme();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [modalMode, setModalMode] = useState('create');
  const [stats, setStats] = useState({});

  const loadAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        per_page: 15,
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
      };

      const response = await announcementService.getAnnouncements(params);

      if (response.success) {
        setAnnouncements(response.data.data);
        setTotalPages(response.data.last_page);
      }
    } catch (error) {
      console.error('Erro ao carregar comunicados:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, statusFilter, priorityFilter]);

  useEffect(() => {
    loadAnnouncements();
    loadStats();
  }, [loadAnnouncements]);

  const loadStats = async () => {
    try {
      const response = await announcementService.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadAnnouncements();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este comunicado?')) {
      try {
        await announcementService.deleteAnnouncement(id);
        loadAnnouncements();
        loadStats();
      } catch (error) {
        console.error('Erro ao excluir comunicado:', error);
        alert('Erro ao excluir comunicado');
      }
    }
  };

  const handlePublish = async (id) => {
    try {
      await announcementService.publishAnnouncement(id);
      loadAnnouncements();
      loadStats();
    } catch (error) {
      console.error('Erro ao publicar comunicado:', error);
      alert('Erro ao publicar comunicado');
    }
  };

  const handleUnpublish = async (id) => {
    try {
      await announcementService.unpublishAnnouncement(id);
      loadAnnouncements();
      loadStats();
    } catch (error) {
      console.error('Erro ao despublicar comunicado:', error);
      alert('Erro ao despublicar comunicado');
    }
  };

  const handleArchive = async (id) => {
    try {
      await announcementService.archiveAnnouncement(id);
      loadAnnouncements();
      loadStats();
    } catch (error) {
      console.error('Erro ao arquivar comunicado:', error);
      alert('Erro ao arquivar comunicado');
    }
  };

  const handleCreateNew = () => {
    setSelectedAnnouncement(null);
    setModalMode('create');
    setShowCreateModal(true);
  };

  const handleEdit = (announcement) => {
    setSelectedAnnouncement(announcement);
    setModalMode('edit');
    setShowCreateModal(true);
  };

  const handleView = (announcement) => {
    setSelectedAnnouncement(announcement);
    setModalMode('view');
    setShowCreateModal(true);
  };

  const handleModalSave = () => {
    loadAnnouncements();
    loadStats();
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: {
        color: 'bg-yellow-500/20 text-yellow-400',
        text: 'Rascunho'
      },
      published: {
        color: 'bg-green-500/20 text-green-400',
        text: 'Publicado'
      },
      archived: {
        color: 'bg-blue-500/20 text-blue-400',
        text: 'Arquivado'
      }
    };
    const badge = badges[status] || badges.draft;

    return (
      <span className={`px-3 py-1 rounded-lg text-xs font-medium ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      low: {
        color: 'bg-blue-500/20 text-blue-400',
        text: 'Baixa'
      },
      normal: {
        color: 'bg-gray-500/20 text-gray-400',
        text: 'Normal'
      },
      high: {
        color: 'bg-yellow-500/20 text-yellow-400',
        text: 'Alta'
      },
      urgent: {
        color: 'bg-red-500/20 text-red-400',
        text: 'Urgente'
      }
    };
    const badge = badges[priority] || badges.normal;

    return (
      <span className={`px-3 py-1 rounded-lg text-xs font-medium ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <Layout>
      <div className="p-6 min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Comunicados</h1>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>Gerencie os comunicados do condomínio</p>
          </div>
          <button
            onClick={handleCreateNew}
            className="px-6 py-3 bg-[#ff6600] text-white rounded-lg hover:bg-[#ff6600]/80 transition-colors flex items-center gap-3"
          >
            <Plus className="w-5 h-5" />
            Novo Comunicado
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className={`${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'} rounded-lg p-6 border ${isDarkMode ? 'border-gray-700' : 'border-orange-500'} rounded-xl`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Total</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stats.total || 0}
                </p>
              </div>
              <FileText className="w-8 h-8 text-[#ff6600]" />
            </div>
          </div>
          <div className={`${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'} rounded-lg p-6 border ${isDarkMode ? 'border-gray-700' : 'border-orange-500'} rounded-xl`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Publicados</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stats.published || 0}
                </p>
              </div>
              <Send className="w-8 h-8 text-[#ff6600]" />
            </div>
          </div>
          <div className={`${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'} rounded-lg p-6 border ${isDarkMode ? 'border-gray-700' : 'border-orange-500'} rounded-xl`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Rascunhos</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stats.drafts || 0}
                </p>
              </div>
              <Edit className="w-8 h-8 text-[#ff6600]" />
            </div>
          </div>
          <div className={`${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'} rounded-lg p-6 border ${isDarkMode ? 'border-gray-700' : 'border-orange-500'} rounded-xl`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Urgentes</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stats.urgent || 0}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-[#ff6600]" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className={`${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'} rounded-lg p-6 mb-8 border ${isDarkMode ? 'border-gray-700' : 'border-orange-500'} rounded-xl`}>
          <form onSubmit={handleSearch} className="flex flex-wrap gap-6">
            <div className="flex-1 min-w-80">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por título ou conteúdo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-white'} border ${isDarkMode ? 'border-[#ff6600]/20' : 'border-gray-300'} rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} ${isDarkMode ? 'placeholder-gray-400' : 'placeholder-gray-500'} focus:ring-2 focus:ring-[#ff6600]/50 focus:border-[#ff6600] transition-colors`}
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`px-4 py-3 ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-white'} border ${isDarkMode ? 'border-[#ff6600]/20' : 'border-gray-300'} rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} focus:ring-2 focus:ring-[#ff6600]/50 focus:border-[#ff6600] transition-colors`}
            >
              <option value="all">Todos os status</option>
              <option value="draft">Rascunho</option>
              <option value="published">Publicado</option>
              <option value="archived">Arquivado</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className={`px-4 py-3 ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-white'} border ${isDarkMode ? 'border-[#ff6600]/20' : 'border-gray-300'} rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} focus:ring-2 focus:ring-[#ff6600]/50 focus:border-[#ff6600] transition-colors`}
            >
              <option value="all">Todas as prioridades</option>
              <option value="low">Baixa</option>
              <option value="normal">Normal</option>
              <option value="high">Alta</option>
              <option value="urgent">Urgente</option>
            </select>
            <button
              type="submit"
              className="px-6 py-3 bg-[#ff6600] text-white rounded-lg hover:bg-[#ff6600]/80 transition-colors flex items-center gap-3"
            >
              <Filter className="w-5 h-5" />
              Filtrar
            </button>
          </form>
        </div>

        {/* Table */}
        <div className={`${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'} rounded-lg overflow-hidden border ${isDarkMode ? 'border-gray-700' : 'border-orange-500'} rounded-xl`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#ff6600]/20">
                  <th className="text-left py-3 px-4 text-[#ff6600] font-medium">
                    Título
                  </th>
                  <th className="text-left py-3 px-4 text-[#ff6600] font-medium">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-[#ff6600] font-medium">
                    Prioridade
                  </th>
                  <th className="text-left py-3 px-4 text-[#ff6600] font-medium">
                    Criado em
                  </th>
                  <th className="text-left py-3 px-4 text-[#ff6600] font-medium">
                    Publicado em
                  </th>
                  <th className="text-left py-3 px-4 text-[#ff6600] font-medium">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <div className="flex justify-center items-center">
                        <div className="w-8 h-8 border-2 border-[#ff6600] border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    </td>
                  </tr>
                ) : announcements.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12">
                      <FileText className="w-12 h-12 text-[#ff6600]/40 mx-auto mb-4" />
                      <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                        Nenhum comunicado encontrado
                      </h3>
                      <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
                        Crie o primeiro comunicado para começar.
                      </p>
                      <button
                        onClick={handleCreateNew}
                        className="px-4 py-2 bg-[#ff6600] text-white rounded-lg hover:bg-[#ff6600]/80 transition-colors"
                      >
                        Criar Primeiro Comunicado
                      </button>
                    </td>
                  </tr>
                ) : (
                  announcements.map((announcement) => (
                    <tr
                      key={announcement.id}
                      className="border-b border-[#ff6600]/10 hover:bg-[#ff6600]/5 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-medium`}>
                          {announcement.title}
                        </div>
                        <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm truncate max-w-xs mt-1`}>
                          {announcement.content.substring(0, 100)}...
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(announcement.status)}
                      </td>
                      <td className="py-4 px-4">
                        {getPriorityBadge(announcement.priority)}
                      </td>
                      <td className={`py-4 px-4 ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-700'}`}>
                        {formatDate(announcement.created_at)}
                      </td>
                      <td className={`py-4 px-4 ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-700'}`}>
                        {formatDate(announcement.published_at)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleView(announcement)}
                            className="p-2 text-[#ff6600] hover:bg-[#ff6600]/20 rounded-lg transition-colors"
                            title="Visualizar"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(announcement)}
                            className="p-2 text-[#ff6600] hover:bg-[#ff6600]/20 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {announcement.status === 'draft' && (
                            <button
                              onClick={() => handlePublish(announcement.id)}
                              className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
                              title="Publicar"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          )}
                          {announcement.status === 'published' && (
                            <>
                              <button
                                onClick={() => handleUnpublish(announcement.id)}
                                className="p-2 text-yellow-400 hover:bg-yellow-500/20 rounded-lg transition-colors"
                                title="Despublicar"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleArchive(announcement.id)}
                                className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                                title="Arquivar"
                              >
                                <Archive className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(announcement.id)}
                            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

        {/* Modal */}
        <AnnouncementModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          mode={modalMode}
          announcement={selectedAnnouncement}
          condominiums={condominiums}
          onSave={handleModalSave}
        />
      </div>
    </Layout>
  );
};

export default AnnouncementsPage;