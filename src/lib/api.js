// Cliente da API para comunicação com o backend
// IMPORTANTE: A URL de produção está hardcoded aqui para garantir que o VITE use o endereço correto do backend.
const API_BASE_URL = 'https://opme-control-backend-fixed-v17-production.up.railway.app/api';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        // Tenta ler o JSON para pegar a mensagem de erro do servidor
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      // Em caso de erro, lança uma exceção para o componente de sincronização
      throw error;
    }
  }

  // Métodos para Notas Fiscais
  async uploadXML(file) {
    const formData = new FormData();
    formData.append('file', file);

    return this.request('/notas-fiscais/upload-xml', {
      method: 'POST',
      headers: {}, // Remove Content-Type para FormData
      body: formData,
    });
  }

  async syncMaino(dataInicio, dataFim) {
    return this.request('/notas-fiscais/sync-maino', {
      method: 'POST',
      body: JSON.stringify({
        data_inicio: dataInicio,
        data_fim: dataFim,
      }),
    });
  }

  async getNotasFiscais(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/notas-fiscais/listar?${queryString}`);
  }

  async getNotaFiscal(id) {
    return this.request(`/notas-fiscais/${id}`);
  }

  async getXMLNotaFiscal(id) {
    return this.request(`/notas-fiscais/${id}/xml`);
  }

  async testMainoConnection() {
    // O frontend faz uma chamada à API do backend
    return this.request('/maino/test-maino');
  }

  async getEstatisticas() {
    return this.request('/notas-fiscais/estatisticas');
  }

  // Métodos para Saldos
  async consultarSaldos(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/saldos/consultar?${queryString}`);
  }

  async getSaldosCliente(cnpj) {
    return this.request(`/saldos/cliente/${cnpj}`);
  }

  async getSaldosProduto(codigo) {
    return this.request(`/saldos/produto/${codigo}`);
  }

  async getResumoSaldos() {
    return this.request('/saldos/resumo');
  }

  async buscarClientes(termo) {
    return this.request(`/saldos/buscar-clientes?q=${encodeURIComponent(termo)}`);
  }

  async buscarProdutos(termo) {
    return this.request(`/saldos/buscar-produtos?q=${encodeURIComponent(termo)}`);
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export const apiClient = new ApiClient();
export default apiClient;
