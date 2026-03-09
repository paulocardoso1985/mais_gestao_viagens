import React, { useState } from 'react';
import { Users, CheckCircle, MessageSquare, MapPin, X, ChevronRight, Compass, Mountain, Coffee, AlertTriangle, Anchor } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, onClick, isActive, subtext, details }) => (
    <div
        onClick={onClick}
        className={`bg-white p-6 rounded-2xl shadow-sm border transition-all h-full flex flex-col group ${onClick ? 'cursor-pointer hover:shadow-md' : ''
            } ${isActive ? 'border-[#f37021] ring-2 ring-orange-500/10' : 'border-slate-100'
            }`}
    >
        <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-xl ${color} ${onClick ? 'group-hover:scale-110 transition-transform' : ''}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            {details && (
                <div className="flex gap-4">
                    {details.map((d, idx) => (
                        <div key={idx} className="flex flex-col items-center">
                            <span className="text-[11px] font-black text-slate-900 border-b-2 border-slate-900 mb-1.5 leading-none">{d.date}</span>
                            <div className="flex flex-col items-center gap-0.5">
                                {d.groups.map((g, gIdx) => (
                                    <span key={gIdx} className="text-[9px] font-bold text-slate-500 leading-none whitespace-nowrap">{g}</span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {isActive && !details && (
                <span className="bg-orange-100 text-[#f37021] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                    Filtro Ativo
                </span>
            )}
        </div>
        <div className="mt-auto flex items-end justify-between">
            <div>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.15em] mb-1">{title}</p>
                <h3 className="text-3xl font-black text-slate-900 leading-none">{value}</h3>
                {subtext && <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">{subtext}</p>}
            </div>
            {onClick && !isActive && <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-400 transition-colors" />}
        </div>
    </div>
);

export default function Overview({ summary, locations, typeFilter, onTypeFilterChange, tourFilter, onTourFilterChange, allergyFilter, onAllergyFilterChange, onCitySelect }) {
    const [showCities, setShowCities] = useState(false);
    const [showAllergies, setShowAllergies] = useState(false);

    // Sort cities by quantity
    const sortedCities = [...(locations || [])].sort((a, b) => b.Qtd - a.Qtd);

    return (
        <div className="mb-8 font-sans">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                <StatCard
                    title="Total de Viajantes"
                    value={summary?.totalPessoas || 0}
                    icon={Users}
                    color="bg-[#f37021]"
                    onClick={() => onTypeFilterChange('all')}
                    isActive={typeFilter === 'all'}
                />
                <StatCard
                    title="Titulares / RSVP"
                    value={summary?.titulares || 0}
                    icon={CheckCircle}
                    color="bg-emerald-500"
                    onClick={() => onTypeFilterChange('Titular')}
                    isActive={typeFilter === 'Titular'}
                    subtext={`Meta: ${summary?.totalDisparos || 112}`}
                />
                <StatCard
                    title="Acompanhantes"
                    value={summary?.acompanhantes || 0}
                    icon={MessageSquare}
                    color="bg-amber-500"
                    onClick={() => onTypeFilterChange('Acompanhante')}
                    isActive={typeFilter === 'Acompanhante'}
                />
                <StatCard
                    title="Locais Mapeados"
                    value={`${locations?.length || 0} Cidades`}
                    icon={MapPin}
                    color="bg-purple-500"
                    onClick={() => setShowCities(true)}
                />
                <StatCard
                    title="Restrições"
                    value={Object.keys(summary?.allergyStats || {}).length}
                    icon={AlertTriangle}
                    color="bg-orange-600"
                    onClick={() => setShowAllergies(true)}
                    isActive={allergyFilter !== 'all'}
                    subtext="Ver Detalhes"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
                <StatCard
                    title="City Tour"
                    value={summary?.tours?.['City Tour'] || 0}
                    icon={Compass}
                    color="bg-rose-500"
                    onClick={() => onTourFilterChange(tourFilter === 'City Tour' ? 'all' : 'City Tour')}
                    isActive={tourFilter === 'City Tour'}
                    details={[
                        { date: '18/05', groups: ['G1:42'] },
                        { date: '19/05', groups: ['G2:42'] }
                    ]}
                />
                <StatCard
                    title="Cavernas Drach"
                    value={summary?.tours?.['Cavernas Drach'] || 0}
                    icon={Mountain}
                    color="bg-indigo-500"
                    onClick={() => onTourFilterChange(tourFilter === 'Cavernas Drach' ? 'all' : 'Cavernas Drach')}
                    isActive={tourFilter === 'Cavernas Drach'}
                    details={[
                        { date: '18/05', groups: ['G3:55'] },
                        { date: '19/05', groups: ['G3:55'] }
                    ]}
                />
                <StatCard
                    title="Tarde Livre"
                    value={summary?.tours?.['Tarde Livre'] || 0}
                    icon={Coffee}
                    color="bg-teal-500"
                    onClick={() => onTourFilterChange(tourFilter === 'Tarde Livre' ? 'all' : 'Tarde Livre')}
                    isActive={tourFilter === 'Tarde Livre'}
                />
                <StatCard
                    title="Catamaran"
                    value={230}
                    icon={Anchor}
                    color="bg-orange-600"
                    details={[
                        { date: '18/05', groups: ['G2:42', 'G4:55'] },
                        { date: '19/05', groups: ['G1:42', 'G3:55'] },
                        { date: '20/05', groups: ['G1: 11', 'G2: 11', 'G3: 11', 'G4: 11', 'G5: 23', 'G6: 02'] }
                    ]}
                />
                <StatCard
                    title="Pendentes"
                    value={summary?.tours?.['Pendente'] || 0}
                    icon={Users}
                    color="bg-slate-400"
                    onClick={() => onTourFilterChange(tourFilter === 'Pendente' ? 'all' : 'Pendente')}
                    isActive={tourFilter === 'Pendente'}
                />
            </div>

            {showCities && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[1100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl relative">
                        <button
                            onClick={() => setShowCities(false)}
                            className="absolute right-6 top-6 p-2 hover:bg-slate-100 rounded-full transition-colors"
                        >
                            <X className="w-6 h-6 text-slate-400" />
                        </button>

                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Cidades Mapeadas</h2>
                            <p className="text-slate-500">Selecione uma cidade para filtrar os participantes.</p>
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {sortedCities.map((loc, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        onCitySelect(loc.Cidade);
                                        setShowCities(false);
                                    }}
                                    className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-orange-50 border border-transparent hover:border-orange-100 transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-orange-100 group-hover:text-[#f37021] transition-colors">
                                            <MapPin className="w-4 h-4" />
                                        </div>
                                        <span className="font-bold text-slate-700 group-hover:text-orange-700">{loc.Cidade}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-slate-400 group-hover:text-orange-400">{loc.Qtd} pessoas</span>
                                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-orange-400" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {showAllergies && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[1100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl relative">
                        <button
                            onClick={() => setShowAllergies(false)}
                            className="absolute right-6 top-6 p-2 hover:bg-slate-100 rounded-full transition-colors"
                        >
                            <X className="w-6 h-6 text-slate-400" />
                        </button>

                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Restrições / Alergias</h2>
                            <p className="text-slate-500">Selecione uma restrição para filtrar os participantes.</p>
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {Object.entries(summary?.allergyStats || {})
                                .sort((a, b) => b[1] - a[1])
                                .map(([allergy, count], idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            onAllergyFilterChange(allergy);
                                            setShowAllergies(false);
                                        }}
                                        className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-orange-50 border border-transparent hover:border-orange-100 transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-500 group-hover:bg-orange-200 transition-colors">
                                                <AlertTriangle className="w-4 h-4" />
                                            </div>
                                            <span className="font-bold text-slate-700 group-hover:text-orange-700 text-left">{allergy}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-slate-400 group-hover:text-orange-400">{count} pessoas</span>
                                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-orange-400" />
                                        </div>
                                    </button>
                                ))}
                            {Object.keys(summary?.allergyStats || {}).length === 0 && (
                                <p className="text-center text-slate-400 py-8 italic text-sm">Nenhuma restrição relatada até o momento.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
