import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Pagination = ({
  currentPage = 1,
  totalItems = 0,
  itemsPerPage = 15,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [10, 15, 25, 50, 100]
}) => {
  const { isDarkMode } = useTheme();
  // Garantir que os valores sejam números válidos
  const validCurrentPage = Number(currentPage) || 1;
  const validTotalItems = Number(totalItems) || 0;
  const validItemsPerPage = Number(itemsPerPage) || 15;

  const totalPages = Math.ceil(validTotalItems / validItemsPerPage);
  const startItem = (validCurrentPage - 1) * validItemsPerPage + 1;
  const endItem = Math.min(validCurrentPage * validItemsPerPage, validTotalItems);

  // Gerar números das páginas para exibir
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Se há poucas páginas, mostrar todas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Lógica para mostrar páginas com reticências
      const startPage = Math.max(1, validCurrentPage - 2);
      const endPage = Math.min(totalPages, validCurrentPage + 2);
      
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) {
          pages.push('...');
        }
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push('...');
        }
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const handlePageClick = (page) => {
    if (page !== '...' && page !== validCurrentPage && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const handlePrevious = () => {
    if (validCurrentPage > 1) {
      onPageChange(validCurrentPage - 1);
    }
  };

  const handleNext = () => {
    if (validCurrentPage < totalPages) {
      onPageChange(validCurrentPage + 1);
    }
  };

  const handleFirst = () => {
    if (validCurrentPage > 1) {
      onPageChange(1);
    }
  };

  const handleLast = () => {
    if (validCurrentPage < totalPages) {
      onPageChange(totalPages);
    }
  };

  if (validTotalItems === 0) {
    return null;
  }

  return (
    <div className={`flex items-center justify-between px-4 py-3 border-t ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      {/* Informações de itens */}
      <div className="flex items-center space-x-4">
        <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Mostrando <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{startItem}</span> a{' '}
          <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{endItem}</span> de{' '}
          <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{validTotalItems}</span> resultados
        </div>
        
        {/* Seletor de itens por página */}
        <div className="flex items-center space-x-2">
          <label className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Itens por página:</label>
          <select
            value={validItemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className={`px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
              isDarkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            {itemsPerPageOptions.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Controles de paginação */}
      <div className="flex items-center space-x-2">
        {/* Primeira página */}
        <button
          onClick={handleFirst}
          disabled={validCurrentPage === 1}
          className={`p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            isDarkMode
              ? 'text-gray-300 hover:bg-gray-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          title="Primeira página"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Página anterior */}
        <button
          onClick={handlePrevious}
          disabled={validCurrentPage === 1}
          className={`p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            isDarkMode
              ? 'text-gray-300 hover:bg-gray-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          title="Página anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Números das páginas */}
        <div className="flex space-x-1">
          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => handlePageClick(page)}
              disabled={page === '...'}
              className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                page === validCurrentPage
                  ? 'bg-[#ff6600] text-white font-medium'
                  : page === '...'
                  ? `${isDarkMode ? 'text-gray-400' : 'text-gray-500'} cursor-default`
                  : `${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        {/* Próxima página */}
        <button
          onClick={handleNext}
          disabled={validCurrentPage === totalPages}
          className={`p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            isDarkMode
              ? 'text-gray-300 hover:bg-gray-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          title="Próxima página"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Última página */}
        <button
          onClick={handleLast}
          disabled={validCurrentPage === totalPages}
          className={`p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            isDarkMode
              ? 'text-gray-300 hover:bg-gray-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          title="Última página"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
