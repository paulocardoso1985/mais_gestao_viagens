import { Users, ClipboardList, ArrowRight, ShieldCheck, Globe, MapPin, LogOut, Folder } from 'lucide-react';

export default function Portal({ onSelect, onLogout }) {
    return (
        <div className="h-screen w-full bg-white flex flex-col md:flex-row overflow-hidden selection:bg-[#f37021]/30 font-sans">
            {/* Left Side: Branding & Mallorca Image */}
            <div className="relative w-full md:w-[45%] lg:w-[50%] h-[40vh] md:h-full overflow-hidden flex flex-col justify-between p-8 md:p-12 lg:p-16">
                <img
                    src="mallorca_hero.png"
                    alt="Mallorca View"
                    className="absolute inset-0 w-full h-full object-cover scale-105 animate-[pulse_12s_ease-in-out_infinite]"
                />
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#0f172a]/95 via-[#1e293b]/60 to-transparent"></div>

                {/* Provider Badge */}
                <div className="relative z-20 animate-in fade-in slide-in-from-left-8 duration-1000">
                    <div className="inline-flex items-center gap-4 px-6 py-4 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[1.5rem] shadow-2xl">
                        <img src="logo.png" alt="Mais Corporativo" className="h-10 w-auto" />
                        <div className="h-6 w-px bg-white/20"></div>
                        <div className="flex flex-col">
                            <span className="text-white text-[10px] font-black uppercase tracking-[0.2em] leading-none mb-1">PROVEDOR DO SISTEMA</span>
                            <span className="text-[#f37021] text-[10px] font-black uppercase tracking-widest drop-shadow-sm">Mais Corporativo</span>
                        </div>
                    </div>
                </div>

                <div className="relative z-20 mt-auto animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="px-4 py-1.5 bg-[#f37021] text-white text-[11px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-[#f37021]/20">Viagem de Incentivo</div>
                        <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
                        <span className="text-white/80 text-xs font-black uppercase tracking-[0.3em]">Mais Corporativo 2026</span>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black text-white leading-[0.9] tracking-tight mb-8 uppercase overflow-visible">
                        Mallorca<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f37021] via-[#ff8c42] to-[#f37021] py-2 px-6 -mx-6 inline-block overflow-visible">Espanha</span>
                    </h1>
                    <div className="flex flex-wrap items-center gap-6 text-slate-300">
                        <div className="flex items-center gap-2.5">
                            <Globe className="w-5 h-5 text-[#f37021]" />
                            <span className="text-sm font-black uppercase tracking-wider">Mar Mediterrâneo</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <MapPin className="w-5 h-5 text-[#f37021]" />
                            <span className="text-sm font-black uppercase tracking-wider">Ilhas Baleares</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Navigation Modules */}
            <div className="flex-1 bg-slate-50 p-4 md:p-6 lg:p-8 flex flex-col relative min-h-0 overflow-y-auto overflow-x-hidden">
                {/* Decorative background glow */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-100/30 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none"></div>

                <div className="max-w-xl mx-auto w-full relative z-10 flex flex-col md:mt-8 md:mb-auto py-2">
                    <header className="mb-2 animate-in fade-in slide-in-from-top-8 duration-700">
                        <div className="flex justify-between items-center mb-1">
                            <h2 className="text-slate-400 text-[9px] font-black uppercase tracking-[0.4em]">Escolha seu Acesso</h2>
                            <button
                                onClick={onLogout}
                                className="flex items-center gap-1.5 px-2 py-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors text-[9px] font-black uppercase tracking-widest"
                            >
                                <LogOut className="w-3 h-3" />
                                <span>Sair</span>
                            </button>
                        </div>
                        <h3 className="text-3xl font-black text-[#1e293b] leading-tight tracking-tight uppercase">
                            Gestão de Eventos <br />
                            <span className="text-[#f37021] italic text-2xl lg:text-3xl">MAIS GESTÃO VIAGENS</span>
                        </h3>
                    </header>

                    <div className="grid grid-cols-1 gap-2.5">
                        {/* RSVP Dashboard Module */}
                        <button
                            onClick={() => onSelect('rsvp')}
                            className="group relative bg-white p-4 rounded-[1.5rem] shadow-sm hover:shadow-[0_15px_30px_-10px_rgba(243,112,33,0.1)] border border-slate-100 hover:border-orange-100 transition-all duration-500 text-left overflow-hidden active:scale-[0.98] animate-in fade-in slide-in-from-right-12 duration-1000 delay-100"
                        >
                            <div className="absolute top-0 right-0 p-3 opacity-[0.03] group-hover:opacity-10 group-hover:rotate-12 transition-all duration-700">
                                <Users className="w-16 h-16" />
                            </div>

                            <div className="relative z-10">
                                <div className="w-9 h-9 bg-orange-50 text-[#f37021] rounded-xl flex items-center justify-center mb-2 group-hover:bg-[#f37021] group-hover:text-white transition-all duration-500 shadow-sm font-bold">
                                    <Users className="w-4.5 h-4.5" />
                                </div>
                                <h4 className="text-lg font-black text-[#1e293b] mb-0.5 group-hover:text-[#f37021] transition-colors uppercase">Dashboard RSVP</h4>
                                <p className="text-slate-500 text-xs leading-relaxed mb-2 max-w-[90%]">
                                    Controle operacional de passageiros, confirmações em tempo real e logística de voos.
                                </p>
                                <div className="flex items-center gap-2 text-[#f37021] text-[9px] font-black uppercase tracking-widest">
                                    Acessar Painel <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-2 transition-transform" />
                                </div>
                            </div>
                        </button>

                        {/* Management System Module */}
                        <button
                            onClick={() => onSelect('management')}
                            className="group relative bg-white p-4 rounded-[1.5rem] shadow-sm hover:shadow-[0_15px_30px_-10px_rgba(30,41,59,0.1)] border border-slate-100 hover:border-slate-300 transition-all duration-500 text-left overflow-hidden active:scale-[0.98] animate-in fade-in slide-in-from-right-12 duration-1000 delay-300"
                        >
                            <div className="absolute top-0 right-0 p-3 opacity-[0.03] group-hover:opacity-10 group-hover:-rotate-12 transition-all duration-700">
                                <ClipboardList className="w-16 h-16" />
                            </div>

                            <div className="relative z-10">
                                <div className="w-9 h-9 bg-slate-900 text-white rounded-xl flex items-center justify-center mb-2 group-hover:bg-[#1e293b] group-hover:scale-110 transition-all duration-500 shadow-sm font-bold">
                                    <ClipboardList className="w-4.5 h-4.5" />
                                </div>
                                <h4 className="text-lg font-black text-[#1e293b] mb-0.5 group-hover:text-slate-600 transition-colors tracking-tight uppercase">Checklist & Day by Day</h4>
                                <p className="text-slate-500 text-xs leading-relaxed mb-2 max-w-[90%]">
                                    Acompanhamento integral de demandas e cronogramas operacionais Mallorca.
                                </p>
                                <div className="flex items-center gap-2 text-slate-800 text-[9px] font-black uppercase tracking-widest">
                                    Acessar Sistema <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-2 transition-transform" />
                                </div>
                            </div>
                        </button>

                        {/* Document Repository Module */}
                        <button
                            onClick={() => onSelect('repository')}
                            className="group relative bg-white p-4 rounded-[1.5rem] shadow-sm hover:shadow-[0_15px_30px_-10px_rgba(79,70,229,0.1)] border border-slate-100 hover:border-indigo-100 transition-all duration-500 text-left overflow-hidden active:scale-[0.98] animate-in fade-in slide-in-from-right-12 duration-1000 delay-500"
                        >
                            <div className="absolute top-0 right-0 p-3 opacity-[0.03] group-hover:opacity-10 group-hover:rotate-6 transition-all duration-700">
                                <Folder className="w-16 h-16" />
                            </div>

                            <div className="relative z-10">
                                <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-2 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-sm font-bold">
                                    <Folder className="w-4.5 h-4.5" />
                                </div>
                                <h4 className="text-lg font-black text-[#1e293b] mb-0.5 group-hover:text-indigo-600 transition-colors uppercase">Repositório de Documentos</h4>
                                <p className="text-slate-500 text-xs leading-relaxed mb-2 max-w-[90%]">
                                    Documentos, burocracias da viagem e apresentação oficial Mallorca.
                                </p>
                                <div className="flex items-center gap-2 text-indigo-600 text-[9px] font-black uppercase tracking-widest">
                                    Acessar Repositório <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-2 transition-transform" />
                                </div>
                            </div>
                        </button>
                    </div>

                    <footer className="mt-2 pt-2 border-t border-slate-200/50 flex items-center justify-between pb-1 animate-in fade-in duration-1000 delay-700">
                        <div className="flex items-center gap-3">
                            <img src="logo.png" alt="Mais Corporativo" className="h-4 w-auto" />
                            <div className="w-px h-3 bg-slate-200"></div>
                        </div>
                        <span className="flex-1 text-center text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">© 2026 Mais Corporativo</span>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-100/50 rounded-lg border border-slate-200/30">
                            <ShieldCheck className="w-3 h-3 text-slate-400" />
                            <span className="text-slate-400 text-[8px] font-black uppercase tracking-widest">Secure</span>
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    );
}
