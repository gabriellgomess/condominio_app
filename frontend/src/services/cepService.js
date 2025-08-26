class CepService {
  /**
   * Busca endereço por CEP usando a API do ViaCEP diretamente
   * @param {string} cep - CEP para buscar
   * @returns {Promise<Object>} Dados do endereço
   */
  async searchByCep(cep) {
    try {
      // Remove formatação do CEP
      const cleanCep = cep.replace(/\D/g, '');
      
      if (cleanCep.length !== 8) {
        throw new Error('CEP deve ter 8 dígitos');
      }

      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      
      if (!response.ok) {
        throw new Error('Erro na consulta do CEP');
      }

      const data = await response.json();
      
      if (data.erro) {
        throw new Error('CEP não encontrado');
      }

      // Padronizar retorno para manter compatibilidade
      return {
        status: 'success',
        data: {
          cep: data.cep,
          street: data.logradouro,
          district: data.bairro,
          city: data.localidade,
          state: data.uf,
          complement: data.complemento
        }
      };
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      throw error;
    }
  }

  /**
   * Valida se o CEP tem formato válido
   * @param {string} cep - CEP para validar
   * @returns {boolean} True se válido
   */
  isValidCep(cep) {
    const cleanCep = cep.replace(/\D/g, '');
    return cleanCep.length === 8;
  }

  /**
   * Formata CEP para exibição
   * @param {string} cep - CEP para formatar
   * @returns {string} CEP formatado
   */
  formatCep(cep) {
    const numbers = cep.replace(/\D/g, '');
    if (numbers.length <= 5) {
      return numbers;
    }
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  }
}

const cepService = new CepService();
export default cepService;