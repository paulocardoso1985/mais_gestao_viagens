import React, { useState } from 'react';
import { Search, Info, Plane, CreditCard, ShieldAlert, Phone, X, Mail, Smartphone, Fingerprint, ChevronRight, Users, AlertTriangle } from 'lucide-react';
import ParticipantsMap from './ParticipantsMap';

export default function ParticipantSearch({ participants, selectedCity, typeFilter, tourFilter, allergyFilter, onCityClear, onTypeClear, onTourClear, onAllergyClear }) {
    const [query, setQuery] = useState('');
    const [selected, setSelected] = useState(null);

    const filtered = participants?.filter(p => {
        const matchesQuery = p.name?.toLowerCase().includes(query.toLowerCase()) || p.cpf?.includes(query);
        const matchesCity = selectedCity ? p.city === selectedCity : true;
        const matchesType = typeFilter !== 'all' ? p.type === typeFilter : true;

        // Normalize for comparison
        const pTour = String(p.tour || '').trim();
        const fTour = String(tourFilter || '').trim();

        const matchesTour = tourFilter !== 'all' ?
            (pTour === fTour || (fTour === 'Pendente' && (!pTour || pTour === 'Pendente'))) : true;

        const matchesAllergy = allergyFilter !== 'all' ? (p.allergies && p.allergies.includes(allergyFilter)) : true;
        return matchesQuery && matchesCity && matchesType && matchesTour && matchesAllergy;
    }) || [];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
            <div className="p-6 border-b border-slate-100 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <h3 className="font-bold text-slate-800">Participantes</h3>
                    <div className="flex items-center gap-2">
                        {selectedCity && (
                            <div className="flex items-center gap-2 bg-orange-50 text-[#f37021] px-3 py-1.5 rounded-full text-xs font-bold border border-orange-100">
                                Cidade: {selectedCity}
                                <button onClick={onCityClear} className="hover:bg-orange-200 rounded-full p-0.5 transition-colors">
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        )}
                        {typeFilter !== 'all' && (
                            <div className="flex items-center gap-2 bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full text-xs font-bold border border-purple-100">
                                Tipo: {typeFilter}
                                <button onClick={onTypeClear} className="hover:bg-purple-200 rounded-full p-0.5 transition-colors">
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        )}
                        {tourFilter !== 'all' && (
                            <div className="flex items-center gap-2 bg-teal-50 text-teal-700 px-3 py-1.5 rounded-full text-xs font-bold border border-teal-100">
                                Passeio: {tourFilter}
                                <button onClick={onTourClear} className="hover:bg-teal-200 rounded-full p-0.5 transition-colors">
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        )}
                        {allergyFilter !== 'all' && (
                            <div className="flex items-center gap-2 bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full text-xs font-bold border border-orange-100">
                                Restrição: {allergyFilter}
                                <button onClick={onAllergyClear} className="hover:bg-orange-200 rounded-full p-0.5 transition-colors">
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="text" placeholder="Buscar participante por nome ou CPF..." className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:ring-4 focus:ring-orange-500/10 focus:border-[#f37021] focus:bg-white transition-all font-bold" value={query} onChange={(e) => setQuery(e.target.value)} />
                </div>
            </div>
            <div className="max-h-[600px] overflow-y-auto custom-scrollbar border border-slate-100/50 rounded-2xl">
                <table className="w-full text-left border-separate border-spacing-0">
                    <thead className="bg-slate-50/95 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Nome</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Tipo</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Cidade</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right border-b border-slate-100">Ação</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {filtered.map(p => (
                            <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-slate-900 border-b border-slate-50">
                                    <div className="flex items-center gap-2">
                                        {p.name}
                                        {p.type === 'Titular' && participants.some(comp => comp.type === 'Acompanhante' && comp.titularName === p.name) && (
                                            <span title="Possui acompanhante" className="text-orange-400">
                                                <Users className="w-3.5 h-3.5" />
                                            </span>
                                        )}
                                        {p.allergies && p.allergies.length > 0 && (
                                            <span title="Possui restrições/alergias" className="text-orange-500">
                                                <AlertTriangle className="w-3.5 h-3.5" />
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${p.type === 'Titular' ? 'bg-orange-100 text-[#f37021]' : 'bg-purple-100 text-purple-700'}`}>{p.type}</span></td>
                                <td className="px-6 py-4 text-slate-600">{p.city} - {p.uf}</td>
                                <td className="px-6 py-4 text-right"><button onClick={() => setSelected(p)} className="text-[#f37021] hover:text-white hover:bg-[#f37021] font-bold text-sm bg-orange-50 px-3 py-1.5 rounded-lg transition-all border border-transparent hover:border-orange-200">Ver Detalhes</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selected && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[1001] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-5xl p-8 shadow-2xl overflow-y-auto max-h-[90vh] relative">
                        <button onClick={() => setSelected(null)} className="absolute right-6 top-6 p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <X className="w-6 h-6 text-slate-400" />
                        </button>

                        <div className="mb-8 p-4 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100">
                            <div>
                                <h2 className="text-3xl font-bold text-slate-900 mb-1">{selected.name}</h2>
                                <p className="text-slate-500 font-medium">
                                    <span className={`px-2 py-0.5 rounded-md text-xs font-bold mr-2 ${selected.type === 'Titular' ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'}`}>
                                        {selected.type.toUpperCase()}
                                    </span>
                                    {selected.titularName && <span className="text-sm">Titular: {selected.titularName}</span>}
                                </p>
                            </div>
                            <div className="text-right hidden sm:block">
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Status RSVP</div>
                                <div className="text-green-600 font-bold flex items-center gap-2 justify-end">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    Confirmado
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                        <div className="flex items-center gap-3 mb-2 text-slate-400">
                                            <Fingerprint className="w-4 h-4" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider">CPF</span>
                                        </div>
                                        <div className="text-slate-900 font-bold text-sm">{selected.cpf}</div>
                                    </div>
                                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm sm:col-span-2">
                                        <div className="flex items-center gap-3 mb-2 text-slate-400">
                                            <Mail className="w-4 h-4" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider">E-mail</span>
                                        </div>
                                        <div className="text-slate-900 font-bold text-sm break-all select-all" title="Clique para selecionar">{selected.email || 'Não informado'}</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                        <div className="flex items-center gap-3 mb-2 text-slate-400">
                                            <Smartphone className="w-4 h-4" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider">Telefone</span>
                                        </div>
                                        <div className="text-slate-900 font-bold text-sm">{selected.phone || 'Não informado'}</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                        <div className="flex items-center gap-3 mb-3 text-blue-600">
                                            <CreditCard className="w-5 h-5" />
                                            <span className="text-xs font-bold uppercase tracking-wider">Documentação de Viagem</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-slate-500 text-[10px] uppercase font-bold mb-1">Número</div>
                                                <div className="text-slate-900 font-bold text-lg tracking-tight">{selected.passport || 'Pendente'}</div>
                                            </div>
                                            {selected.passportPhoto && (
                                                <a
                                                    href={selected.passportPhoto}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1.5 bg-blue-50 text-blue-600 px-3 py-2 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors"
                                                >
                                                    Visualizar Foto
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                        <div className="flex items-center gap-3 mb-3 text-indigo-600">
                                            <Plane className="w-5 h-5" />
                                            <span className="text-xs font-bold uppercase tracking-wider">Experiência Mallorca</span>
                                        </div>
                                        <p className="text-slate-600 text-sm leading-relaxed">{selected.tour || 'Roteiro ainda não selecionado pelo participante.'}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="bg-red-50 p-5 rounded-2xl border border-red-100/50">
                                        <div className="flex items-center gap-3 mb-2 text-red-500">
                                            <ShieldAlert className="w-5 h-5" />
                                            <span className="text-xs font-bold uppercase tracking-wider text-red-600">Restrições / Alergias</span>
                                        </div>
                                        <div className="space-y-1">
                                            {selected.allergies && selected.allergies.length > 0 ? (
                                                selected.allergies.map((all, i) => (
                                                    <div key={i} className="text-red-900 font-bold flex items-start gap-2">
                                                        <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 shrink-0"></div>
                                                        {all}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-red-900 font-bold opacity-50">Nenhuma informada</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100/50">
                                        <div className="flex items-center gap-3 mb-2 text-blue-500">
                                            <Phone className="w-5 h-5" />
                                            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Contato de Emergência</span>
                                        </div>
                                        <div className="text-blue-900 font-bold">{selected.emergency?.name || 'Não informado'}</div>
                                        <div className="text-blue-700 text-sm font-medium">{selected.emergency?.phone}</div>
                                    </div>
                                </div>

                                {/* Relationships Section */}
                                <div className="mt-8 pt-8 border-t border-slate-100">
                                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Users className="w-4 h-4 text-blue-600" />
                                        Vínculos de Viagem
                                    </h4>

                                    {selected.type === 'Titular' ? (
                                        <div className="space-y-3">
                                            <p className="text-xs text-slate-500 font-medium italic">Acompanhantes vinculados a este titular:</p>
                                            {participants.filter(p => p.type === 'Acompanhante' && p.titularName === selected.name).length > 0 ? (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {participants
                                                        .filter(p => p.type === 'Acompanhante' && p.titularName === selected.name)
                                                        .map(acomp => (
                                                            <button
                                                                key={acomp.id}
                                                                onClick={() => setSelected(acomp)}
                                                                className="flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 border border-purple-100 rounded-xl transition-all group"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white">
                                                                        <Users className="w-4 h-4" />
                                                                    </div>
                                                                    <div className="text-left">
                                                                        <span className="block text-sm font-bold text-purple-900 group-hover:text-purple-700">{acomp.name}</span>
                                                                        <span className="text-[10px] uppercase font-bold text-purple-400">Acompanhante</span>
                                                                    </div>
                                                                </div>
                                                                <ChevronRight className="w-4 h-4 text-purple-300 group-hover:text-purple-600" />
                                                            </button>
                                                        ))
                                                    }
                                                </div>
                                            ) : (
                                                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 text-sm text-center italic">
                                                    Este titular não possui acompanhantes cadastrados.
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <p className="text-xs text-slate-500 font-medium italic">Este acompanhante está vinculado ao titular:</p>
                                            {participants.find(p => p.type === 'Titular' && p.name === selected.titularName) ? (
                                                <div className="max-w-md">
                                                    <button
                                                        onClick={() => setSelected(participants.find(p => p.type === 'Titular' && p.name === selected.titularName))}
                                                        className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-xl transition-all group"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                                                                <Users className="w-4 h-4" />
                                                            </div>
                                                            <div className="text-left">
                                                                <span className="block text-sm font-bold text-blue-900 group-hover:text-blue-700">{selected.titularName}</span>
                                                                <span className="text-[10px] uppercase font-bold text-blue-400">Titular Responsável</span>
                                                            </div>
                                                        </div>
                                                        <ChevronRight className="w-4 h-4 text-blue-300 group-hover:text-blue-600" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 text-sm">
                                                    Titular: <span className="font-bold text-slate-600">{selected.titularName}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="lg:col-span-1 flex flex-col">
                                <div className="mb-4 flex items-center justify-between">
                                    <span className="text-sm font-bold text-slate-900">Localização de Origem</span>
                                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">{selected.city} - {selected.uf}</span>
                                </div>
                                <ParticipantsMap
                                    locations={null}
                                    selectedLocation={selected}
                                    className="h-[100%] min-h-[300px] mb-0 rounded-3xl"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
