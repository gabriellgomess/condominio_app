import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const Pagination = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [10, 25, 50, 100]
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

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
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, currentPage + 2);
      
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
    if (page !== '...' && page !== currentPage && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handleFirst = () => {
    if (currentPage > 1) {
      onPageChange(1);
    }
  };

  const handleLast = () => {
    if (currentPage < totalPages) {
      onPageChange(totalPages);
    }
  };

  if (totalItems === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-[#1a1a1a] border-t border-[#31a196]/20">
      {/* Informações de itens */}
      <div className="flex items-center space-x-4">
        <div className="text-sm text-[#f3f7f1]">
          Mostrando <span className="font-medium text-white">{startItem}</span> a{' '}
          <span className="font-medium text-white">{endItem}</span> de{' '}
          <span className="font-medium text-white">{totalItems}</span> resultados
        </div>
        
        {/* Seletor de itens por página */}
        <div className="flex items-center space-x-2">
          <label className="text-sm text-[#f3f7f1]">Itens por página:</label>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="px-2 py-1 bg-[#2a2a2a] border border-[#31a196]/30 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#31a196] focus:border-transparent"
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
          disabled={currentPage === 1}
          className="p-2 text-[#f3f7f1] hover:bg-[#31a196]/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Primeira página"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Página anterior */}
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className="p-2 text-[#f3f7f1] hover:bg-[#31a196]/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                page === currentPage
                  ? 'bg-[#31a196] text-white font-medium'
                  : page === '...'
                  ? 'text-[#f3f7f1] cursor-default'
                  : 'text-[#f3f7f1] hover:bg-[#31a196]/20'
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        {/* Próxima página */}
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="p-2 text-[#f3f7f1] hover:bg-[#31a196]/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Próxima página"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Última página */}
        <button
          onClick={handleLast}
          disabled={currentPage === totalPages}
          className="p-2 text-[#f3f7f1] hover:bg-[#31a196]/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Última página"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
