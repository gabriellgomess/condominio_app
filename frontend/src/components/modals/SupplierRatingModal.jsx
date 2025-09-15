import React, { useState } from 'react';
import { Star, Save, X, MessageSquare } from 'lucide-react';
import supplierService from '../../services/supplierService';

const SupplierRatingModal = ({ 
  isOpen, 
  onClose, 
  supplier, 
  onRatingSaved 
}) => {
  const [rating, setRating] = useState(supplier?.evaluation || 0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStarClick = (starValue) => {
    setRating(starValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Por favor, selecione uma avaliação');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await supplierService.evaluate(supplier.id, {
        evaluation: rating,
        comment: comment.trim()
      });

      if (response.status === 'success') {
        if (onRatingSaved) {
          onRatingSaved(response.data);
        }
        onClose();
      } else {
        setError(response.message || 'Erro ao salvar avaliação');
      }
    } catch (error) {
      console.error('Erro ao avaliar fornecedor:', error);
      setError('Erro ao salvar avaliação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (currentRating, interactive = true) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-8 h-8 transition-colors duration-200 ${
              star <= currentRating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-400 hover:text-yellow-300'
            } ${interactive ? 'cursor-pointer hover:scale-110' : ''}`}
            onClick={() => interactive && handleStarClick(star)}
          />
        ))}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Star className="w-6 h-6 text-[#ff6600]" />
            <h2 className="text-xl font-semibold text-white">Avaliar Fornecedor</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <div className="bg-[#2a2a2a] rounded-lg p-4 mb-4">
            <h3 className="text-lg font-medium text-white mb-2">{supplier?.company_name}</h3>
            <p className="text-[#f3f7f1] text-sm">{supplierService.getCategoryName(supplier?.category)}</p>
            {supplier?.contact_name && (
              <p className="text-[#ff6600]/80 text-sm">Contato: {supplier.contact_name}</p>
            )}
          </div>

          <div className="text-center">
            <p className="text-[#f3f7f1] mb-4">Como você avalia o serviço prestado?</p>
            <div className="flex justify-center mb-2">
              {renderStars(rating)}
            </div>
            <p className="text-sm text-[#ff6600]">
              {rating === 0 ? 'Selecione uma avaliação' : 
               rating === 1 ? 'Muito ruim' :
               rating === 2 ? 'Ruim' :
               rating === 3 ? 'Regular' :
               rating === 4 ? 'Bom' :
               rating === 5 ? 'Excelente' : ''}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <MessageSquare className="w-4 h-4 inline mr-1" />
              Comentário (opcional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white focus:border-[#ff6600] focus:outline-none resize-none"
              placeholder="Deixe um comentário sobre o serviço prestado..."
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">{comment.length}/500 caracteres</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || rating === 0}
              className="px-4 py-2 bg-[#ff6600] text-white rounded-lg hover:bg-[#ff6600]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Salvar Avaliação</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplierRatingModal;
