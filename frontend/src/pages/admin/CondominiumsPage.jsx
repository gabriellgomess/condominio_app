import React, { useState } from 'react';
import Layout from '../../components/Layout';

const CondominiumsPage = () => {
  const [condominiums] = useState([
    {
      id: 1,
      name: 'Residencial Verde',
      address: 'Rua das Flores, 123',
      units: 48,
      blocks: 4,
      status: 'Ativo',
      created_at: '2025-01-15'
    },
    {
      id: 2,
      name: 'Condomínio Solar',
      address: 'Av. do Sol, 456',
      units: 32,
      blocks: 2,
      status: 'Ativo',
      created_at: '2025-02-20'
    },
    {
      id: 3,
      name: 'Jardim das Palmeiras',
      address: 'Rua das Palmeiras, 789',
      units: 24,
      blocks: 3,
      status: 'Em construção',
      created_at: '2025-03-10'
    }
  ]);

  return (
    <Layout 
      title="Gerenciar Condomínios" 
      breadcrumbs={['Dashboard', 'Condomínios']}
    >
      {/* Header Actions */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Condomínios</h2>
          <p className="text-[#f3f7f1]">Gerencie todos os condomínios do sistema</p>
        </div>
        <button className="btn-primary">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Novo Condomínio
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="card p-6 text-center">
          <div className="text-3xl font-bold text-[#31a196] mb-2">{condominiums.length}</div>
          <div className="text-[#f3f7f1]">Total</div>
        </div>
        <div className="card p-6 text-center">
          <div className="text-3xl font-bold text-[#31a196] mb-2">
            {condominiums.filter(c => c.status === 'Ativo').length}
          </div>
          <div className="text-[#f3f7f1]">Ativos</div>
        </div>
        <div className="card p-6 text-center">
          <div className="text-3xl font-bold text-[#31a196] mb-2">
            {condominiums.reduce((sum, c) => sum + c.units, 0)}
          </div>
          <div className="text-[#f3f7f1]">Unidades</div>
        </div>
        <div className="card p-6 text-center">
          <div className="text-3xl font-bold text-[#31a196] mb-2">
            {condominiums.reduce((sum, c) => sum + c.blocks, 0)}
          </div>
          <div className="text-[#f3f7f1]">Blocos</div>
        </div>
      </div>

      {/* Condominiums Table */}
      <div className="card">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">Lista de Condomínios</h3>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Buscar condomínio..."
                className="px-4 py-2 bg-[#080d08]/80 border border-[#31a196]/30 rounded-lg text-white placeholder-[#31a196]/60 focus:outline-none focus:ring-2 focus:ring-[#31a196] focus:border-transparent"
              />
              <select className="px-4 py-2 bg-[#080d08]/80 border border-[#31a196]/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#31a196] focus:border-transparent">
                <option value="">Todos os status</option>
                <option value="Ativo">Ativo</option>
                <option value="Em construção">Em construção</option>
                <option value="Inativo">Inativo</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#31a196]/20">
                  <th className="text-left py-3 px-4 text-[#31a196] font-medium">Nome</th>
                  <th className="text-left py-3 px-4 text-[#31a196] font-medium">Endereço</th>
                  <th className="text-left py-3 px-4 text-[#31a196] font-medium">Unidades</th>
                  <th className="text-left py-3 px-4 text-[#31a196] font-medium">Blocos</th>
                  <th className="text-left py-3 px-4 text-[#31a196] font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-[#31a196] font-medium">Criado em</th>
                  <th className="text-left py-3 px-4 text-[#31a196] font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {condominiums.map((condominium) => (
                  <tr key={condominium.id} className="border-b border-[#31a196]/10 hover:bg-[#31a196]/5 transition-colors">
                    <td className="py-4 px-4 text-white font-medium">{condominium.name}</td>
                    <td className="py-4 px-4 text-[#f3f7f1]">{condominium.address}</td>
                    <td className="py-4 px-4 text-[#f3f7f1]">{condominium.units}</td>
                    <td className="py-4 px-4 text-[#f3f7f1]">{condominium.blocks}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        condominium.status === 'Ativo' 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      }`}>
                        {condominium.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-[#f3f7f1] text-sm">
                      {new Date(condominium.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        <button className="p-2 text-[#31a196] hover:bg-[#31a196]/20 rounded-lg transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button className="p-2 text-[#31a196] hover:bg-[#31a196]/20 rounded-lg transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CondominiumsPage;
