import React, { useState, useEffect } from 'react';
import { ArrowLeft, Folder, ExternalLink, FileText, Download, CloudUpload, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { uploadFileRemote, fetchFilesRemote } from '../services/api';

export default function DocumentRepository({ onBack }) {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadFiles();
    }, []);

    const loadFiles = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchFilesRemote();
            if (result.success) {
                setFiles(result.files || []);
            } else {
                setError(result.error || 'Erro ao carregar lista de arquivos.');
            }
        } catch (error) {
            console.error('Erro ao carregar arquivos:', error);
            setError('Falha na comunicação com o servidor.');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setUploading(true);
        setFeedback(null);

        try {
            const reader = new FileReader();
            reader.onload = async () => {
                const base64 = reader.result.split(',')[1];
                const result = await uploadFileRemote(base64, file.name, file.type, 'User');

                if (result.success) {
                    setFeedback({ type: 'success', message: 'Arquivo enviado com sucesso!' });
                    loadFiles(); // Atualiza a lista
                } else {
                    setFeedback({ type: 'error', message: 'Erro ao enviar: ' + result.error });
                }
                setUploading(false);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            setFeedback({ type: 'error', message: 'Erro no processamento do arquivo.' });
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={onBack}
                            className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors group"
                        >
                            <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                                <Folder className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-slate-900 leading-none mb-1 uppercase tracking-tight">Repositório de Documentos</h1>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Documentos técnicos e templates</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
                {/* 1. Downloads and Upload Section (First as requested) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {/* Native Upload Section */}
                    <div className="lg:col-span-1 bg-indigo-600 rounded-3xl p-8 shadow-xl shadow-indigo-100 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                            <CloudUpload className="w-32 h-32" />
                        </div>
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div>
                                <h3 className="text-lg font-black mb-3 uppercase tracking-widest flex items-center gap-2">
                                    <CloudUpload className="w-6 h-6" />
                                    Anexar Arquivo
                                </h3>
                                <p className="text-indigo-100 text-sm leading-relaxed mb-8 font-medium">
                                    Selecione documentos da viagem para salvar no repositório oficial Mallorca.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <label className={`flex items-center gap-3 px-6 py-4 bg-white text-indigo-600 rounded-2xl transition-all text-xs font-black uppercase tracking-widest w-full justify-center shadow-lg cursor-pointer hover:bg-indigo-50 active:scale-95 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                                    {uploading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Enviando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <CloudUpload className="w-4 h-4" />
                                            <span>Escolher Arquivo</span>
                                        </>
                                    )}
                                    <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                                </label>

                                {feedback && (
                                    <div className={`p-3 rounded-xl flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider animate-in fade-in slide-in-from-top-2 ${feedback.type === 'success' ? 'bg-indigo-500 text-white' : 'bg-red-500 text-white'
                                        }`}>
                                        {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                        {feedback.message}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Dynamic Listing & Templates Section */}
                    <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                <FileText className="w-4 h-4 text-indigo-600" />
                                Arquivos no Repositório
                            </h3>
                            <button onClick={loadFiles} className="text-slate-400 hover:text-indigo-600 transition-colors">
                                <Loader2 className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2">
                            {/* Static/Pinned Files (Voucher) */}
                            <a
                                href="https://drive.google.com/file/d/1NIJaLxMItDBu-5iFR616GbnI_56353dN/view?usp=sharing"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-50 text-red-600 rounded-lg group-hover:bg-red-600 group-hover:text-white transition-colors">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-slate-900 leading-tight">Voucher Mais Corporativo 2026</p>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Template Oficial PDF</p>
                                    </div>
                                </div>
                                <Download className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-all" />
                            </a>

                            {/* Dynamic Files */}
                            {loading && files.length === 0 ? (
                                <div className="col-span-full py-12 flex flex-col items-center text-slate-300">
                                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Carregando Repositório...</p>
                                </div>
                            ) : error ? (
                                <div className="col-span-full py-12 flex flex-col items-center text-red-300 border-2 border-dashed border-red-50 rounded-3xl">
                                    <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-center px-4">{error}</p>
                                    <button onClick={loadFiles} className="mt-4 text-[9px] font-black underline uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors">
                                        Tentar Novamente
                                    </button>
                                </div>
                            ) : files.length > 0 ? (
                                files.map(file => (
                                    <a
                                        key={file.id}
                                        href={file.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div className="truncate max-w-[150px]">
                                                <p className="text-xs font-black text-slate-900 leading-tight truncate">{file.name}</p>
                                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{file.date}</p>
                                            </div>
                                        </div>
                                        <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-600 transition-all" />
                                    </a>
                                ))
                            ) : (
                                !loading && (
                                    <div className="col-span-full py-12 flex flex-col items-center text-slate-300 border-2 border-dashed border-slate-100 rounded-3xl">
                                        <Folder className="w-8 h-8 mb-2 opacity-50" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">Nenhum arquivo anexado ainda</p>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. Canva Presentation (Bottom) */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Apresentação Oficial</h2>
                            <p className="text-slate-500 font-medium text-sm">Confira guias, logísticas e detalhes técnicos da Viagem Mallorca 2026.</p>
                        </div>
                        <a
                            href="https://www.canva.com/design/DAG4rcOR0GE/GHxtYDaKzDcKw_-CQLoKkw/view"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all text-[10px] font-black uppercase tracking-widest shadow-lg"
                        >
                            <span>Tela Cheia</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                    </div>

                    <div className="relative w-full h-0 pb-[56.25%] shadow-xl rounded-2xl overflow-hidden border border-slate-200">
                        <iframe
                            loading="lazy"
                            className="absolute inset-0 w-full h-full border-none p-0 m-0"
                            src="https://www.canva.com/design/DAG4rcOR0GE/GHxtYDaKzDcKw_-CQLoKkw/view?embed"
                            allowFullScreen={true}
                            allow="fullscreen"
                            title="Apresentação Mallorca"
                        >
                        </iframe>
                    </div>
                </div>
            </main>

            <footer className="py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-t border-slate-200 bg-white mt-auto">
                © 2026 Mais Corporativo • Gestão de Eventos
            </footer>
        </div>
    );
}
