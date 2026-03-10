import React, { useEffect, useState } from 'react';
import { fetchData, fetchManagementData } from './services/api';
import Overview from './components/Overview';
import ParticipantSearch from './components/ParticipantSearch';
import ParticipantsMap from './components/ParticipantsMap';
import AuthGate from './components/AuthGate';
import Portal from './components/Portal';
import ManagementSystem from './components/ManagementSystem';
import DocumentRepository from './components/DocumentRepository';
import RSVPForm from './components/RSVPForm';
import { RefreshCw, LayoutDashboard, LogOut, ArrowLeft, PlusCircle } from 'lucide-react';

function App() {
  const [data, setData] = useState(null);
  const [managementData, setManagementData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('portal'); // 'portal', 'rsvp', 'management'
  const [selectedCity, setSelectedCity] = useState(null);
  const [typeFilter, setTypeFilter] = useState('all');
  const [tourFilter, setTourFilter] = useState('all');
  const [allergyFilter, setAllergyFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [rsvpResult, mgmtResult] = await Promise.all([
        fetchData(),
        fetchManagementData()
      ]);
      setData(rsvpResult);
      setManagementData(mgmtResult);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('mais_corp_rsvp_auth');
    window.location.reload();
  };

  useEffect(() => {
    loadAllData();
  }, []);

  if (loading && !managementData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-[#f37021] animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-medium italic">Sincronizando com Google Sheets...</p>
        </div>
      </div>
    );
  }

  // Se for uma rota pública direta (mocking roteamento simples)
  if (window.location.pathname === '/rsvp') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="mb-8 text-center">
            <img src="logo.png" alt="Mais Corporativo Logo" className="h-16 w-auto mx-auto mb-4" />
            <h1 className="text-2xl font-black text-slate-900">Mallorca Experience 2026</h1>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">Confirmação de Presença RSVP</p>
        </div>
        <RSVPForm 
            isOpen={true} 
            onClose={() => window.location.href = '/'} 
            onSuccess={() => alert('Cadastro realizado com sucesso! Nos vemos em Mallorca.')}
            participants={data?.participants || []}
        />
      </div>
    );
  }

  return (
    <AuthGate>
      {currentView === 'portal' ? (
        <Portal onSelect={setCurrentView} onLogout={handleLogout} />
      ) : currentView === 'management' ? (
        <ManagementSystem
          data={managementData}
          onBack={() => setCurrentView('portal')}
          onRefresh={loadAllData}
        />
      ) : currentView === 'repository' ? (
        <DocumentRepository onBack={() => setCurrentView('portal')} />
      ) : (
        <div className="min-h-screen bg-slate-50">
          <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <button onClick={() => setCurrentView('portal')} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors">
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-4">
                  <img src="logo.png" alt="Mais Corporativo Logo" className="h-10 w-auto" />
                  <div className="h-8 w-px bg-slate-200"></div>
                  <div>
                    <h1 className="text-xl font-black text-slate-900 leading-none mb-1">RSVP Manager</h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mais Corporativo Mallorca 2026</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={loadAllData} className="px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all text-slate-600 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border border-slate-200/50">
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sincronizar</span>
                </button>
                <button 
                  onClick={() => setShowAddForm(true)}
                  className="px-4 py-2 bg-[#f37021] hover:bg-orange-600 rounded-xl transition-all text-white flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-500/20"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Novo</span>
                </button>
                <div className="w-px h-8 bg-slate-200"></div>
                <button onClick={handleLogout} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl transition-all">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </header>

          <main className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center gap-2 mb-8 text-slate-400">
              <LayoutDashboard className="w-5 h-5" />
              <span className="text-sm font-semibold uppercase tracking-widest">Dashboard de Operações RSVP</span>
            </div>

            <Overview
              summary={data.summary}
              locations={data.locations}
              typeFilter={typeFilter}
              onTypeFilterChange={setTypeFilter}
              tourFilter={tourFilter}
              onTourFilterChange={setTourFilter}
              allergyFilter={allergyFilter}
              onAllergyFilterChange={setAllergyFilter}
              onCitySelect={setSelectedCity}
            />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2">
                <ParticipantSearch
                  participants={data.participants}
                  selectedCity={selectedCity}
                  typeFilter={typeFilter}
                  tourFilter={tourFilter}
                  allergyFilter={allergyFilter}
                  onCityClear={() => setSelectedCity(null)}
                  onTypeClear={() => setTypeFilter('all')}
                  onTourClear={() => setTourFilter('all')}
                  onAllergyClear={() => setAllergyFilter('all')}
                />
              </div>
              <div className="xl:col-span-1">
                <ParticipantsMap
                  locations={data.locations}
                  selectedLocation={null} // Keep as global view
                />
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-2xl text-white shadow-xl mt-6">
                  <h4 className="text-xl font-bold mb-2">Resumo Operacional</h4>
                  <p className="text-blue-100 text-sm mb-6 leading-relaxed">
                    Dados em tempo real das fontes Mais Corporativo. Utilize a busca ao lado para detalhes individuais.
                  </p>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end border-b border-white/10 pb-2">
                      <span className="text-blue-200 text-sm">Titulares</span>
                      <span className="text-2xl font-bold">{data.participants.filter(p => p.type === 'Titular').length}</span>
                    </div>
                    <div className="flex justify-between items-end border-b border-white/10 pb-2">
                      <span className="text-blue-200 text-sm">Acompanhantes</span>
                      <span className="text-2xl font-bold">{data.participants.filter(p => p.type === 'Acompanhante').length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
          {/* Adicionar participantes individuais */}
          <RSVPForm 
              isOpen={showAddForm} 
              onClose={() => setShowAddForm(false)} 
              onSuccess={loadAllData}
              isAdmin={true}
              participants={data?.participants || []}
          />
        </div>
      )}
    </AuthGate>
  );
}

export default App;
