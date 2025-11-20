import React from 'react';
import { Link } from 'react-router-dom';
import {
  Building,
  ArrowRight,
  DollarSign,
  FileText,
  Shield,
  Users,
  Calendar,
  Bell,
  Truck,
  BarChart3,
  CheckCircle2,
  TrendingUp,
  Scale,
  GraduationCap,
  Briefcase,
  UserCog,
  MessageCircle,
  Sparkles,
  Lock,
  Zap,
  Heart
} from 'lucide-react';
import Logo from '../components/ui/Logo';

const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-800/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Logo
                variant="horizontal"
                size="medium"
                theme="light"
                className="flex-shrink-0"
              />
            </div>
            <Link
              to="/login"
              className="px-6 py-2.5 bg-gradient-to-r from-[#ff6600] to-[#fa7a25] text-white rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              Entrar
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-16 pb-24 text-center">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            {/* <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              Sistema Completo de Gestão Condominial
            </div> */}

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="text-gray-900">
                Gestão Condominial
              </span>
              <br />
              <span className="bg-gradient-to-r from-[#ff6600] to-[#fa7a25] bg-clip-text text-transparent">
                Inteligente e Completa
              </span>
            </h1>
          </div>

          <p className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto">
            Plataforma moderna e intuitiva para gestão financeira, administrativa e operacional
            do seu condomínio em um só lugar.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link
              to="/login"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#ff6600] to-[#fa7a25] text-white rounded-xl font-semibold text-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              <span>Acessar Sistema</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-16">
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Lock className="w-8 h-8 text-orange-600" />
              </div>
              <div className="text-sm font-medium text-gray-700">LGPD</div>
              <div className="text-xs text-gray-500">Conforme</div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Zap className="w-8 h-8 text-orange-600" />
              </div>
              <div className="text-sm font-medium text-gray-700">Cloud</div>
              <div className="text-xs text-gray-500">Seguro</div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Heart className="w-8 h-8 text-orange-600" />
              </div>
              <div className="text-sm font-medium text-gray-700">Suporte</div>
              <div className="text-xs text-gray-500">Dedicado</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Features Section */}
      <section className="bg-white py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              Módulos Principais
            </h2>
            <div className="h-1 w-16 bg-gradient-to-r from-[#ff6600] to-[#fa7a25] mx-auto rounded-full mb-6"></div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Soluções integradas para todas as necessidades do seu condomínio
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Gestão Financeira */}
            <div className="group p-8 bg-white border-2 border-gray-100 rounded-2xl hover:border-orange-200 hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-orange-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <DollarSign className="w-7 h-7 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Gestão Financeira</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Controle total de receitas, despesas, inadimplência e projeções financeiras com subcontas personalizadas.
              </p>
              <ul className="space-y-2.5">
                <li className="flex items-start text-sm text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Receitas e despesas por subcontas</span>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Controle de inadimplência e cobranças</span>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Análises e alertas inteligentes</span>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Gráficos e projeções financeiras</span>
                </li>
              </ul>
            </div>

            {/* Gestão Administrativa */}
            <div className="group p-8 bg-white border-2 border-gray-100 rounded-2xl hover:border-orange-200 hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-orange-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Briefcase className="w-7 h-7 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Gestão Administrativa</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Contratos, documentos, controles obrigatórios (PPCI, laudos) e gestão completa de fornecedores.
              </p>
              <ul className="space-y-2.5">
                <li className="flex items-start text-sm text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Contratos e prestadores de serviços</span>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>PPCI, extintores, laudos e certificados</span>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Notificações e multas condominiais</span>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Assembleias e enquetes online</span>
                </li>
              </ul>
            </div>

            {/* Gestão Operacional */}
            <div className="group p-8 bg-white border-2 border-gray-100 rounded-2xl hover:border-orange-200 hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-orange-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <UserCog className="w-7 h-7 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Gestão Operacional</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Controle de portaria, ronda, zeladoria, limpeza e todos os serviços operacionais do condomínio.
              </p>
              <ul className="space-y-2.5">
                <li className="flex items-start text-sm text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Serviços de portaria e ronda</span>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Zeladoria e limpeza</span>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Controle de recursos humanos</span>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Relatórios e gráficos operacionais</span>
                </li>
              </ul>
            </div>

            {/* Portaria */}
            <div className="group p-8 bg-white border-2 border-gray-100 rounded-2xl hover:border-orange-200 hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-orange-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-7 h-7 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Portaria e Segurança</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Controle de acesso, visitantes, entregas e correspondências com registro completo.
              </p>
              <ul className="space-y-2.5">
                <li className="flex items-start text-sm text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Controle de acesso e visitantes</span>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Registro de entregas e encomendas</span>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Correspondências protocoladas</span>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Relatórios de segurança</span>
                </li>
              </ul>
            </div>

            {/* Área do Morador */}
            <div className="group p-8 bg-white border-2 border-gray-100 rounded-2xl hover:border-orange-200 hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-orange-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-7 h-7 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Área do Morador</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Portal completo para moradores com cadastros, comunicados, documentos e calendário de eventos.
              </p>
              <ul className="space-y-2.5">
                <li className="flex items-start text-sm text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Cadastro de moradores e PETs</span>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Veículos e visitantes autorizados</span>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Comunicados e documentos</span>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Calendário de eventos e anúncios</span>
                </li>
              </ul>
            </div>

            {/* Reservas */}
            <div className="group p-8 bg-white border-2 border-gray-100 rounded-2xl hover:border-orange-200 hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-orange-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Calendar className="w-7 h-7 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Reservas</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Gestão completa de reservas de áreas comuns com controle de disponibilidade e regras personalizadas.
              </p>
              <ul className="space-y-2.5">
                <li className="flex items-start text-sm text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Salão de festas e churrasqueiras</span>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Quiosques e espaços compartilhados</span>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Controle de taxas e multas</span>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Calendário integrado</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Features Section */}
      <section className="bg-gray-50 py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
                Recursos Adicionais
              </h2>
              <div className="h-1 w-16 bg-gradient-to-r from-[#ff6600] to-[#fa7a25] mx-auto rounded-full mb-6"></div>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Ferramentas complementares para uma gestão ainda mais completa
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Fornecedores */}
              <div className="p-6 bg-white rounded-xl border border-gray-100 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Truck className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Fornecedores</h3>
                <p className="text-sm text-gray-600">
                  Cadastro completo de fornecedores e prestadores com histórico e orçamentos
                </p>
              </div>

              {/* Ocorrências */}
              <div className="p-6 bg-white rounded-xl border border-gray-100 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Bell className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Ocorrências</h3>
                <p className="text-sm text-gray-600">
                  Registro e acompanhamento de ocorrências e solicitações de manutenção
                </p>
              </div>

              {/* Relatórios */}
              <div className="p-6 bg-white rounded-xl border border-gray-100 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Relatórios</h3>
                <p className="text-sm text-gray-600">
                  Gráficos, análises comparativas e projeções financeiras inteligentes
                </p>
              </div>

              {/* Legislação */}
              <div className="p-6 bg-white rounded-xl border border-gray-100 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Scale className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Legislação</h3>
                <p className="text-sm text-gray-600">
                  Acesso rápido à legislação pertinente e normas condominiais
                </p>
              </div>

              {/* Capacitação */}
              <div className="p-6 bg-white rounded-xl border border-gray-100 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <GraduationCap className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Capacitações</h3>
                <p className="text-sm text-gray-600">
                  Conceitos e treinamentos sobre gestão condominial e legislação
                </p>
              </div>

              {/* Chatbot */}
              <div className="p-6 bg-white rounded-xl border border-gray-100 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <MessageCircle className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Chatbot</h3>
                <p className="text-sm text-gray-600">
                  Assistente virtual para responder dúvidas sobre administração condominial
                </p>
              </div>

              {/* Documentos */}
              <div className="p-6 bg-white rounded-xl border border-gray-100 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Documentos</h3>
                <p className="text-sm text-gray-600">
                  Geração automática de documentos, atas, contratos e formulários
                </p>
              </div>

              {/* Estrutura */}
              <div className="p-6 bg-white rounded-xl border border-gray-100 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Building className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Estrutura</h3>
                <p className="text-sm text-gray-600">
                  Gestão de blocos, unidades e padrões construtivos do condomínio
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto bg-gradient-to-br from-orange-50 to-white rounded-3xl border-2 border-orange-100 p-12">
            <div className="grid md:grid-cols-3 gap-12 text-center">
              <div className="group">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <div className="text-xl font-bold text-gray-900 mb-2">Eficiência</div>
                <div className="text-sm text-gray-600">
                  Automatização de processos e redução de tempo operacional
                </div>
              </div>

              <div className="group">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <div className="text-xl font-bold text-gray-900 mb-2">Transparência</div>
                <div className="text-sm text-gray-600">
                  Acesso completo às informações financeiras e administrativas
                </div>
              </div>

              <div className="group">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div className="text-xl font-bold text-gray-900 mb-2">Conformidade</div>
                <div className="text-sm text-gray-600">
                  Controle de obrigações legais e documentação completa
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-[#ff6600] to-[#fa7a25] py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Modernize a gestão do seu condomínio
            </h2>
            <p className="text-xl text-gray-100 mb-10 max-w-2xl mx-auto">
              Sistema completo, seguro e intuitivo para administradores, síndicos e moradores
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/login"
                className="inline-flex items-center px-10 py-4 bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                <span>Acessar Sistema</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <Logo
                variant="horizontal"
                size="medium"
                theme="light"
                className="flex-shrink-0"
              />
            </div>
            <p className="text-gray-100 mb-6 text-lg max-w-md mx-auto">
              Sistema de gestão condominial completo e integrado
            </p>
            {/* <div className="flex justify-center items-center space-x-6 mb-6">
              <Link
                to="/login"
                className="text-orange-600 hover:text-orange-700 transition-colors duration-300 font-medium"
              >
                Acesso ao Sistema
              </Link>
            </div> */}
            <div className="pt-6 border-t border-gray-600">
              <p className="text-gray-500 text-sm">
                © 2025 Sistema de Gestão Condominial. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
