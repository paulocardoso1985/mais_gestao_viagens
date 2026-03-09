import React, { useState } from 'react';
import {
    Calendar,
    CheckCircle2,
    Clock,
    User,
    MessageSquare,
    Search,
    Filter,
    ArrowLeft,
    Download,
    Printer,
    Upload,
    Users,
    Mail,
    Settings,
    ShieldCheck,
    Bell,
    Shield,
    Trash2,
    Plus,
    RotateCcw,
    LayoutDashboard,
    ClipboardCheck,
    ExternalLink,
    ChevronUp,
    ChevronDown,
    ChevronRight,
    AlertCircle,
    RefreshCw,
    Briefcase,
    X,
    FileText,
    LogOut
} from 'lucide-react';
import { 
    updateTaskRemote, 
    createTaskRemote, 
    deleteTaskRemote, 
    moveTaskRemote, 
    fetchSystemLogsRemote,
    importSpreadsheetData,
    createUserRemote,
    updateUserRemote,
    deleteUserRemote,
    checkAlertsRemote
} from '../services/api';
import Papa from 'papaparse';

const RESPONSIBLE_COLORS = {
    'MAIS CORPORATIVO': { bg: 'bg-orange-100', text: 'text-[#f37021]', border: 'border-orange-200' },
    'FORNECEDOR': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
    'AGÊNCIA': { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
    'DIRETORIA': { bg: 'bg-slate-900', text: 'text-white', border: 'border-slate-800' },
    'DEFAULT': { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' }
};

const getRespColor = (name) => {
    if (!name) return RESPONSIBLE_COLORS.DEFAULT;
    const upper = name.toUpperCase();
    if (upper.includes('MAIS')) return RESPONSIBLE_COLORS['MAIS CORPORATIVO'];
    if (upper.includes('BRIT') || upper.includes('MAIS')) return RESPONSIBLE_COLORS['MAIS CORPORATIVO'];
    if (upper.includes('AGEN')) return RESPONSIBLE_COLORS['AGÊNCIA'];
    if (upper.includes('DIRE')) return RESPONSIBLE_COLORS['DIRETORIA'];
    return RESPONSIBLE_COLORS.DEFAULT;
};

const ResponsibleTag = ({ name }) => {
    const colors = getRespColor(name);
    return (
        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter border ${colors.bg} ${colors.text} ${colors.border}`}>
            {name}
        </span>
    );
};

const formatDateBR = (dateStr) => {
    if (!dateStr) return '';
    try {
        const iso = toInputDate(dateStr);
        if (!iso) return dateStr;
        const [y, m, d] = iso.split('-');
        return `${d}/${m}/${y}`;
    } catch (e) {
        return dateStr;
    }
};

const toInputDate = (ddmmyyyy) => {
    if (!ddmmyyyy || typeof ddmmyyyy !== 'string') return '';
    const separator = ddmmyyyy.includes('/') ? '/' : (ddmmyyyy.includes('-') ? '-' : '');
    if (!separator) return '';
    const parts = ddmmyyyy.split(separator);
    if (parts.length < 3) return '';

    let d, m, y;
    if (separator === '-' && parts[0].length === 4) {
        [y, m, d] = parts;
    } else {
        [d, m, y] = parts;
        // Swap if looks like MM/DD/YYYY
        if (parseInt(m) > 12 && parseInt(d) <= 12) [d, m] = [m, d];
    }
    return `${y}-${(m || '').toString().padStart(2, '0')}-${(d || '').toString().padStart(2, '0')}`;
};

const fromInputDate = (yyyymmdd) => {
    if (!yyyymmdd || typeof yyyymmdd !== 'string' || !yyyymmdd.includes('-')) return '';
    const parts = yyyymmdd.split('-');
    if (parts.length < 3) return '';
    const [y, m, d] = parts;
    return `${d}/${m}/${y}`;
};

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2).toString().padStart(2, '0');
    const min = i % 2 === 0 ? '00' : '30';
    return `${hour}:${min}`;
});

const isOverdue = (dateStr, status) => {
    if (!status) return false;
    const s = status.toLowerCase();
    if (s.includes('finalizado') || s.includes('ok') || s.includes('concluído')) return false;
    if (!dateStr) return false;

    try {
        const parts = dateStr.includes('/') ? dateStr.split('/') : dateStr.split('-');
        if (parts.length < 3) return false;

        // Defensive parsing for DD/MM/YYYY
        let [d, m, y] = parts.map(p => parseInt(p, 10));
        if (dateStr.includes('-') && parts[0].length === 4) [y, m, d] = [parts[0], parts[1], parts[2]].map(p => parseInt(p, 10));

        // If it looks like MM/DD/YYYY (US), swap it to be safe if m > 12
        if (m > 12 && d <= 12) [d, m] = [m, d];

        const targetDate = new Date(y, m - 1, d);
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        return targetDate < now;
    } catch (e) { return false; }
};

const isNearExpiry = (dateStr, status) => {
    const s = status?.toLowerCase() || 'pendente';
    if (s.includes('finalizado') || s.includes('ok') || s.includes('concluído')) return false;
    if (!dateStr) return false;

    try {
        const parts = dateStr.includes('/') ? dateStr.split('/') : dateStr.split('-');
        if (parts.length < 3) return false;

        // Defensive parsing for DD/MM/YYYY
        let [d, m, y] = parts.map(p => parseInt(p, 10));
        if (dateStr.includes('-') && parts[0].length === 4) [y, m, d] = [parts[0], parts[1], parts[2]].map(p => parseInt(p, 10));

        // Detect if it was parsed as MM/DD/YYYY (US) accidentally
        if (m > 12 && d <= 12) [d, m] = [m, d];

        const targetDate = new Date(y, m - 1, d);
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const diffTime = targetDate - now;
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 3;
    } catch (e) { return false; }
};

const StatusBadge = ({ status, date }) => {
    const s = status?.toLowerCase() || '';
    const overdue = isOverdue(date, status);
    const nearing = !overdue && isNearExpiry(date, status);

    if (s.includes('finalizado') || s.includes('ok') || s.includes('concluído')) {
        return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-wider">Finalizado</span>;
    }
    if (overdue) {
        return (
            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Atrasado
            </span>
        );
    }
    if (nearing) {
        return (
            <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3 h-3" /> {status || 'Pendente'}
            </span>
        );
    }
    if (s.includes('andamento') || s.includes('processo')) {
        return <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-wider">Em Andamento</span>;
    }
    if (s.includes('não iniciado')) {
        return <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-wider">Não Iniciado</span>;
    }
    return <span className="px-3 py-1 bg-slate-100 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-wider">{status || 'Pendente'}</span>;
};

const SystemLogModal = ({ onClose }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        const loadLogs = async () => {
            const data = await fetchSystemLogsRemote();
            setLogs(data);
            setLoading(false);
        };
        loadLogs();
    }, []);

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900">Logs de Atividade do Sistema</h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Últimas 100 movimentações</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/30">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin" />
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Carregando Auditoria...</p>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="text-center py-20 text-slate-400 font-bold italic">Nenhum log registrado ainda.</div>
                    ) : (
                        <div className="space-y-3">
                            {logs.map((log, i) => (
                                <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-6 hover:border-indigo-100 transition-colors">
                                    <div className="shrink-0 text-[10px] font-black text-slate-400 font-mono w-32 pt-1 border-r border-slate-100 pr-4">
                                        {log.timestamp ? new Date(log.timestamp).toLocaleString('pt-BR') : '---'}
                                    </div>
                                    <div className="shrink-0 w-24">
                                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter block text-center ${log.action === 'CREATE' ? 'bg-emerald-50 text-emerald-600' :
                                            log.action === 'DELETE' ? 'bg-red-50 text-red-600' :
                                                log.action === 'UPDATE' ? 'bg-blue-50 text-blue-600' :
                                                    'bg-slate-100 text-slate-500'
                                            }`}>
                                            {log.action}
                                        </span>
                                    </div>
                                    <div className="shrink-0 w-24">
                                        <span className="px-2 py-1 bg-slate-50 text-slate-400 border border-slate-100 rounded-lg text-[9px] font-black uppercase tracking-widest block text-center">
                                            {log.module}
                                        </span>
                                    </div>
                                    <div className="flex-1 text-sm font-bold text-slate-700">
                                        {log.item}
                                    </div>
                                    <div className="shrink-0 text-[10px] font-black text-slate-300 uppercase">
                                        {log.user || 'Sistema'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const TaskDetailsModal = ({ task, onClose, onSave, onRefresh, activeTab, checklistSections = [], users = [] }) => {
    const [editData, setEditData] = useState({ ...task });
    const [isSaving, setIsSaving] = useState(false);
    const currentUser = JSON.parse(localStorage.getItem('mais_corp_user') || '{}');

    if (!task) return null;
    const taskDate = editData.endDate || editData.startDate || editData.date;
    const overdue = isOverdue(taskDate, editData.status);

    const handleSave = async () => {
        setIsSaving(true);
        // Create audit log entry
        const now = new Date().toLocaleString('pt-BR');
        const newLog = `[${now}] ${currentUser.name || 'Sistema'} alterou a tarefa.`;
        const updatedTask = {
            ...editData,
            history: editData.history ? `${editData.history}\n${newLog}` : newLog,
            type: activeTab
        };

        // Delegate persistence to the parent
        await onSave(updatedTask);

        setIsSaving(false);
        onClose();
    };

    const handleDelete = async () => {
        if (!window.confirm('Tem certeza que deseja excluir esta tarefa?')) return;
        setIsSaving(true);
        const type = activeTab;
        const success = await deleteTaskRemote(task, type, currentUser.name);

        if (success && success.success) {
            // Wait 1s for Google Sheets to update CSV export
            await new Promise(resolve => setTimeout(resolve, 1000));
            if (onRefresh) await onRefresh();
            onClose();
        } else {
            const errorMsg = success?.error || (success ? JSON.stringify(success) : 'Erro desconhecido');
            const remoteTab = type === 'timeline' ? 'Cronograma' : 'Checklist';
            alert(`Erro ao excluir tarefa na planilha: ${errorMsg}\n\nID da Tarefa: ${task.id}\nTipo Enviado: ${type}\nAba Alvo: ${remoteTab}\nSubject: ${task.subject || task.action}`);
        }
        setIsSaving(false);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
                <div className="p-8 border-b border-slate-100 flex justify-between items-start shrink-0">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <StatusBadge status={editData.status} date={taskDate} />
                            {overdue && <span className="text-[10px] font-black text-red-500 uppercase tracking-widest animate-pulse">Atrasado</span>}
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 leading-tight">{editData.subject || editData.action}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
                    {task.id?.toString()?.includes('timeline') ? (
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Ação / Título do Cronograma</label>
                            <input
                                type="text"
                                value={editData.action || ''}
                                onChange={(e) => setEditData({ ...editData, action: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 font-bold text-slate-700 focus:ring-2 focus:ring-orange-500/20 focus:border-[#f37021] outline-none transition-all"
                                placeholder="Descreva a ação do cronograma (Coluna D)"
                            />
                        </div>
                    ) : (
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Assunto / Descrição da Tarefa</label>
                            <input
                                type="text"
                                value={editData.subject || ''}
                                onChange={(e) => setEditData({ ...editData, subject: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                placeholder="Descreva o assunto da tarefa (Coluna A)"
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Empresa Responsável</label>
                                <input
                                    type="text"
                                    value={editData.responsible || ''}
                                    onChange={(e) => setEditData({ ...editData, responsible: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 font-bold text-slate-700 focus:ring-2 focus:ring-orange-500/20 focus:border-[#f37021] outline-none transition-all"
                                    placeholder="Ex: MAIS CORPORATIVO"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Agente (Operacional)</label>
                                <div className="relative group">
                                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                                    <select
                                        value={editData.agent || ''}
                                        onChange={(e) => setEditData({ ...editData, agent: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-3 font-bold text-slate-700 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all appearance-none"
                                    >
                                        <option value="">Selecione Agente...</option>
                                        {users.map(u => (
                                            <option key={u.name} value={u.name}>{u.name}</option>
                                        ))}
                                        <option value="OUTRO">OUTRO / MANUAL</option>
                                    </select>
                                </div>
                                {editData.agent === 'OUTRO' && (
                                    <input
                                        type="text"
                                        className="mt-2 w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-2 font-bold text-slate-700 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                                        placeholder="Digite o nome do agente manualmente"
                                        onChange={(e) => setEditData({ ...editData, agent: e.target.value.toUpperCase() })}
                                    />
                                )}
                            </div>
                        </div>

                        <div className="space-y-6">
                            {task.id?.toString()?.includes('timeline') ? (
                                <>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Data Início (dd/mm/aaaa)</label>
                                        <div className="relative group">
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-orange-500" />
                                            <input
                                                type="date"
                                                value={toInputDate(editData.startDate || editData.date)}
                                                onChange={(e) => setEditData({ ...editData, startDate: fromInputDate(e.target.value) })}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-3 font-bold text-slate-700 focus:ring-2 focus:ring-orange-500/20 focus:border-[#f37021] outline-none transition-all appearance-none uppercase"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Data Finalização (dd/mm/aaaa)</label>
                                        <div className="relative group">
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-orange-500" />
                                            <input
                                                type="date"
                                                value={toInputDate(editData.endDate || editData.date)}
                                                onChange={(e) => setEditData({ ...editData, endDate: fromInputDate(e.target.value) })}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-3 font-bold text-slate-700 focus:ring-2 focus:ring-orange-500/20 focus:border-[#f37021] outline-none transition-all appearance-none uppercase"
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Data Início (dd/mm/aaaa)</label>
                                        <div className="relative group">
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-orange-500" />
                                            <input
                                                type="date"
                                                value={toInputDate(editData.startDate)}
                                                onChange={(e) => setEditData({ ...editData, startDate: fromInputDate(e.target.value) })}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-3 font-bold text-slate-700 focus:ring-2 focus:ring-orange-500/20 focus:border-[#f37021] outline-none transition-all appearance-none uppercase"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Data Finalização (dd/mm/aaaa)</label>
                                        <div className="relative group">
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-orange-500" />
                                            <input
                                                type="date"
                                                value={toInputDate(editData.endDate)}
                                                onChange={(e) => setEditData({ ...editData, endDate: fromInputDate(e.target.value) })}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-3 font-bold text-slate-700 focus:ring-2 focus:ring-orange-500/20 focus:border-[#f37021] outline-none transition-all appearance-none uppercase"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Status</label>
                                <div className="relative group">
                                    <ClipboardCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500" />
                                    <select
                                        value={editData.status?.toUpperCase() || ''}
                                        onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-3 font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none"
                                    >
                                        <option value="">Selecione status...</option>
                                        <option value="NÃO INICIADO">NÃO INICIADO</option>
                                        <option value="EM ANDAMENTO">EM ANDAMENTO</option>
                                        <option value="FINALIZADO">FINALIZADO</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Horário</label>
                                <div className="relative group">
                                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-orange-500" />
                                    <select
                                        value={editData.time || ''}
                                        onChange={(e) => setEditData({ ...editData, time: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-3 font-bold text-slate-700 focus:ring-2 focus:ring-orange-500/20 focus:border-[#f37021] outline-none transition-all appearance-none"
                                    >
                                        <option value="">Selecione...</option>
                                        {TIME_OPTIONS.map(time => (
                                            <option key={time} value={time}>{time}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Categoria / Escopo</label>
                                <div className="relative group">
                                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#f37021]" />
                                    <input
                                        type="text"
                                        list="checklist-sections"
                                        value={editData.category || ''}
                                        onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                                        placeholder="Digite ou selecione categoria..."
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-3 font-bold text-slate-700 focus:ring-2 focus:ring-orange-500/20 focus:border-[#f37021] outline-none transition-all"
                                    />
                                    <datalist id="checklist-sections">
                                        {checklistSections.map(section => (
                                            <option key={section} value={section} />
                                        ))}
                                        <option value="OUTROS" />
                                    </datalist>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Documento em Anexo (Link)</label>
                        <div className="relative group">
                            <ExternalLink className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={editData.link || ''}
                                onChange={(e) => setEditData({ ...editData, link: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-3 font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                placeholder="https://docs.google.com/..."
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Histórico & Observações</label>
                        <textarea
                            value={editData.observation || ''}
                            onChange={(e) => setEditData({ ...editData, observation: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] p-6 font-bold text-slate-600 focus:ring-2 focus:ring-orange-500/20 focus:border-[#f37021] outline-none transition-all min-h-[120px] resize-none"
                            placeholder="Descreva o andamento da tarefa..."
                        />
                    </div>

                    {editData.history && (
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Log de Auditoria</label>
                            <div className="bg-slate-900 rounded-2xl p-4 font-mono text-[10px] text-emerald-400/80 space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
                                {editData.history.split('\n').map((line, i) => <div key={i}>{line}</div>)}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center shrink-0">
                    <div>
                        {true && (
                            <button
                                onClick={handleDelete}
                                disabled={isSaving}
                                className="flex items-center gap-2 px-6 py-3 text-red-500 hover:bg-red-50 rounded-2xl text-sm font-black transition-all disabled:opacity-50"
                            >
                                <Trash2 className="w-4 h-4" />
                                Excluir
                            </button>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-8 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-black text-slate-600 hover:bg-slate-50 transition-all">Cancelar</button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-8 py-3 bg-[#f37021] text-white rounded-2xl text-sm font-black shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all disabled:opacity-50"
                        >
                            {isSaving ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TimelineItem = ({ item, onSelect, onMove }) => {
    const overdue = isOverdue(item.date, item.status);
    return (
        <div className="relative pl-8 pb-8 group">
            <div className="absolute left-[-15px] top-6 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button
                    onClick={(e) => { e.stopPropagation(); onMove(item.id, 'up', 'timeline'); }}
                    className="p-1.5 bg-white shadow-md border border-slate-100 rounded-full text-slate-400 hover:text-[#f37021] transition-all hover:scale-110"
                    title="Subir"
                >
                    <ChevronUp className="w-3 h-3" />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onMove(item.id, 'down', 'timeline'); }}
                    className="p-1.5 bg-white shadow-md border border-slate-100 rounded-full text-slate-400 hover:text-[#f37021] transition-all hover:scale-110"
                    title="Descer"
                >
                    <ChevronDown className="w-3 h-3" />
                </button>
            </div>
            <div className="absolute left-0 top-0 bottom-0 w-px bg-slate-200 group-last:bg-transparent"></div>
            <div className={`absolute left-[-4px] top-6 w-2 h-2 rounded-full ring-4 transition-transform group-hover:scale-125 ${overdue ? 'bg-red-500 ring-red-50' : 'bg-[#f37021] ring-orange-50'}`}></div>

            <div className={`bg-white p-6 rounded-3xl border shadow-sm hover:shadow-md transition-all cursor-pointer ${overdue ? 'border-red-100' : 'border-slate-100'}`} onClick={() => onSelect(item)}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${overdue ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-[#f37021]'}`}>
                            <Clock className="w-4 h-4" />
                        </div>
                        <span className="font-black text-slate-900">{item.time || 'Horário a definir'}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span className={`text-sm font-bold ${overdue ? 'text-red-500 italic' : 'text-slate-500'}`}>
                            {item.startDate && item.endDate && item.startDate !== item.endDate
                                ? `${formatDateBR(item.startDate)} → ${formatDateBR(item.endDate)}`
                                : formatDateBR(item.endDate || item.startDate || item.date || item.dateGroup)}
                        </span>
                        {overdue && <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-[8px] font-black uppercase rounded-md tracking-tighter">Atrasada</span>}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {(item.responsible || '').split(/[,/]/).map((r, i) => (
                            <ResponsibleTag key={i} name={r.trim()} />
                        ))}
                    </div>
                </div>

                <div className="flex justify-between items-start gap-4">
                    <h4 className="text-lg font-black text-slate-800 leading-tight">{item.action}</h4>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                </div>

                {item.observation && (
                    <div className="mt-4 flex items-start gap-3 p-4 bg-slate-50 rounded-2xl text-xs text-slate-500 italic">
                        <MessageSquare className="w-4 h-4 mt-0.5 shrink-0 text-slate-400" />
                        <p className="line-clamp-2">{item.observation}</p>
                    </div>
                )}

                {(item.coResponsible || item.agent) && (
                    <div className="mt-4 flex flex-wrap gap-3">
                        {item.coResponsible && (
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <CheckCircle2 className="w-3 h-3" />
                                CORRESPONSÁVEL: {item.coResponsible}
                            </div>
                        )}
                        {item.agent && (
                            <div className="flex items-center gap-2 text-[10px] font-black text-teal-500 uppercase tracking-widest">
                                <Briefcase className="w-3 h-3" />
                                AGENTE: {item.agent}
                            </div>
                        )}
                        <StatusBadge status={item.status} date={item.endDate || item.date} />
                    </div>
                )}

                {item.history && (
                    <div className="mt-4 p-4 bg-slate-900 rounded-2xl font-mono text-[9px] text-emerald-400/80 space-y-1 max-h-24 overflow-y-auto custom-scrollbar border border-slate-800">
                        {item.history.split('\n').map((line, i) => <div key={i} className="flex gap-2">
                            <span className="text-emerald-900 shrink-0">[{i + 1}]</span>
                            <span>{line}</span>
                        </div>)}
                    </div>
                )}
            </div>
        </div>
    );
};

const AlertCard = ({ title, type, delayed, nearing, onSelect }) => {
    const isRed = delayed > 0;
    const isYellow = !isRed && nearing > 0;
    const isGreen = !isRed && !isYellow;

    let bgColor = 'bg-emerald-50';
    let borderColor = 'border-emerald-100';
    let iconColor = 'text-emerald-500';
    let textColor = 'text-emerald-700';

    if (isRed) {
        bgColor = 'bg-red-50';
        borderColor = 'border-red-100';
        iconColor = 'text-red-500';
        textColor = 'text-red-700';
    } else if (isYellow) {
        bgColor = 'bg-amber-50';
        borderColor = 'border-amber-100';
        iconColor = 'text-amber-500';
        textColor = 'text-amber-700';
    }

    return (
        <div
            onClick={() => {
                const status = delayed > 0 ? 'ATRASADO' : (nearing > 0 ? 'ATENÇÃO' : 'TODOS');
                onSelect(title, type, status);
            }}
            className={`flex-1 min-w-[300px] p-5 rounded-3xl border-2 ${borderColor} ${bgColor} cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all group shadow-sm`}
        >
            <div className="flex items-start gap-4">
                <div className={`p-3 rounded-2xl bg-white shadow-md ${iconColor} shrink-0`}>
                    {isRed ? <AlertCircle className="w-5 h-5" /> : isYellow ? <Clock className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-black bg-white/50 px-2 py-0.5 rounded-full text-slate-400 border border-slate-100 tracking-widest uppercase">{type}</span>
                        <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-wider truncate">{title}</h4>
                    </div>
                    <div className="space-y-0.5">
                        {delayed > 0 && (
                            <div className="text-[13px] font-black text-red-700 leading-tight">
                                {delayed} {delayed === 1 ? 'tarefa atrasada' : 'tarefas atrasadas'} precisando de atenção!
                            </div>
                        )}
                        {nearing > 0 && (
                            <div className="text-[13px] font-black text-amber-700 leading-tight">
                                {nearing} {nearing === 1 ? 'tarefa próxima' : 'tarefas próximas'} ao vencimento!
                            </div>
                        )}
                        {delayed === 0 && nearing === 0 && (
                            <div className="text-[13px] font-black text-emerald-700 leading-tight">
                                Todas tarefas em dia até o momento!
                            </div>
                        )}
                    </div>
                </div>
                <div className={`mt-2 opacity-0 group-hover:opacity-100 transition-opacity ${iconColor}`}>
                    <ChevronRight className="w-5 h-5" />
                </div>
            </div>
        </div>
    );
};

export default function ManagementSystem({ data, onBack, onRefresh }) {
    const currentUser = JSON.parse(localStorage.getItem('mais_corp_user') || '{}');
    
    const [activeTab, setActiveTab] = useState(() => localStorage.getItem('rsvp_mgmt_tab') || 'timeline');

    // Persist active tab choice
    React.useEffect(() => {
        localStorage.setItem('rsvp_mgmt_tab', activeTab);
    }, [activeTab]);
    const [isLoading, setIsLoading] = useState(false);
    const [showLogs, setShowLogs] = useState(false);
    const [searchQuery, setSearchQuery] = useState({ timeline: '', checklist: '' });
    const [selectedTask, setSelectedTask] = useState(null);
    const [localEdits, setLocalEdits] = useState({ timeline: {}, checklist: {} });
    const [filters, setFilters] = useState({
        timeline: { responsible: 'TODOS', status: 'TODOS', agent: 'TODOS', period: 'TODOS' },
        checklist: { responsible: 'TODOS', status: 'TODOS', agent: 'TODOS', period: 'TODOS' }
    });
    const [dateRange, setDateRange] = useState({
        timeline: { start: '', end: '' },
        checklist: { start: '', end: '' }
    });
    const [openGroups, setOpenGroups] = useState({});

    const toggleGroup = (groupName) => {
        setOpenGroups(prev => ({
            ...prev,
            [groupName]: !prev[groupName]
        }));
    };

    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importType, setImportType] = useState('participants');

    const handleImportFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const csvData = results.data;
                setIsLoading(true);
                try {
                    const res = await importSpreadsheetData(csvData, importType, currentUser.name);
                    if (res.success) {
                        alert(`Importados ${res.count} itens com sucesso!`);
                        if (onRefresh) onRefresh();
                    } else {
                        alert(`Erro na importação: ${res.error}`);
                    }
                } catch (error) {
                    alert(`Erro na importação: ${error.message}`);
                }
                setIsLoading(false);
                setIsImportModalOpen(false);
            }
        });
    };

    const checklistSections = (data?.checklist || [])
        .filter(item => !item.responsible && item.subject)
        .map(item => item.subject);

    const [usersList, setUsersList] = useState(data?.users || []);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);

    const checkAlerts = async () => {
        try {
            await checkAlertsRemote();
        } catch (e) {}
    };

    React.useEffect(() => {
        if (currentUser.role === 'ADMIN') {
            checkAlerts();
            const interval = setInterval(checkAlerts, 1000 * 60 * 60); // Every hour
            return () => clearInterval(interval);
        }
    }, []);

    const handleSaveTask = async (updatedTask) => {
        setIsLoading(true);
        const type = activeTab;
        const isNew = updatedTask.id.toString().startsWith('new-');

        const success = await updateTaskRemote(updatedTask, type, currentUser.name);

        if (success && success.success) {
            await new Promise(resolve => setTimeout(resolve, 800));
            if (onRefresh) await onRefresh();
            setLocalEdits(prev => {
                const newEdits = { ...prev };
                delete newEdits[type][updatedTask.id];
                return newEdits;
            });
            setSelectedTask(null);
        } else {
            const errorMsg = success?.error || (success ? JSON.stringify(success) : 'Erro desconhecido');
            alert('Erro ao salvar: ' + errorMsg);
        }
        setIsLoading(false);
    };

    const handleSaveUser = async (userData) => {
        setIsLoading(true);
        const res = userData.id 
            ? await updateUserRemote(userData) 
            : await createUserRemote(userData);
        
        if (res.success) {
            if (onRefresh) await onRefresh();
            setIsUserModalOpen(false);
        } else {
            alert('Erro ao salvar usuário: ' + res.error);
        }
        setIsLoading(false);
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Excluir este usuário?')) return;
        setIsLoading(true);
        const res = await deleteUserRemote(userId);
        if (res.success) {
            if (onRefresh) await onRefresh();
        }
        setIsLoading(false);
    };

    const handleAddTask = () => {
        const type = activeTab;
        const newTask = {
            id: `new-${type}-${Date.now()}`,
            status: 'Pendente',
            history: `[${new Date().toLocaleString('pt-BR')}] Tarefa criada por ${currentUser.name || 'Sistema'}.`,
            responsible: 'MAIS CORPORATIVO',
            ...(type === 'timeline'
                ? { action: '', time: '', startDate: '', endDate: '', agent: '' }
                : { subject: '', startDate: '', endDate: '', category: checklistSections[0] || 'OUTROS' })
        };
        setSelectedTask(newTask);
    };

    const handleMoveTask = async (id, direction, type) => {
        setIsLoading(true);
        const success = await moveTaskRemote(id, direction, type, currentUser.name);
        if (success && success.success) {
            if (onRefresh) await onRefresh();
        } else {
            alert('Erro ao movimentar tarefa: ' + (success?.error || 'Erro desconhecido'));
        }
        setIsLoading(false);
    };

    const getMergedItem = (item, type) => {
        const edits = localEdits[type];
        if (!edits) return item;
        const edit = edits[item.id];
        if (edit?._deleted) return null;
        return edit || item;
    };

    const getCombinedList = (originalList, type) => {
        const list = originalList?.map(item => getMergedItem(item, type)).filter(Boolean) || [];
        // Add completely new items
        const edits = localEdits[type] || {};
        const newItems = Object.values(edits).filter(item =>
            item.id?.toString()?.startsWith('new-') && !item._deleted
        );
        return [...list, ...newItems];
    };

    const handleClearFilters = () => {
        setSearchQuery(prev => ({ ...prev, [activeTab]: '' }));
        setFilters(prev => ({
            ...prev,
            [activeTab]: { responsible: 'TODOS', status: 'TODOS', agent: 'TODOS', period: 'TODOS' }
        }));
        setDateRange(prev => ({
            ...prev,
            [activeTab]: { start: '', end: '' }
        }));
    };

    const hasActiveFilters = () => {
        const f = filters[activeTab];
        if (!f) return (searchQuery[activeTab] || '') !== '';
        return (searchQuery[activeTab] || '') !== '' ||
            f.responsible !== 'TODOS' ||
            f.status !== 'TODOS' ||
            f.agent !== 'TODOS' ||
            f.period !== 'TODOS';
    };

    const activeSearch = searchQuery[activeTab] || '';
    const activeFilters = filters[activeTab] || { responsible: 'TODOS', status: 'TODOS', agent: 'TODOS', period: 'TODOS' };
    const activeRange = dateRange[activeTab] || { start: '', end: '' };
    const filteredTasks = getCombinedList(data?.[activeTab], activeTab).filter(item => {
        const matchesSearch = (item.action || item.subject || '').toLowerCase().includes(activeSearch.toLowerCase()) ||
            (item.responsible || '').toLowerCase().includes(activeSearch.toLowerCase());

        const matchesResp = activeFilters.responsible === 'TODOS' ||
            (item.responsible || '').toUpperCase().includes(activeFilters.responsible.toUpperCase());

        const matchesStatus = activeFilters.status === 'TODOS' ||
            (activeFilters.status === 'ATRASADO' && isOverdue(item.endDate || item.date || item.startDate, item.status)) ||
            (activeFilters.status === 'ATENÇÃO' && isNearExpiry(item.endDate || item.date || item.startDate, item.status)) ||
            (activeFilters.status === 'URGENTE' && (isOverdue(item.endDate || item.date || item.startDate, item.status) || isNearExpiry(item.endDate || item.date || item.startDate, item.status))) ||
            (item.status || 'PENDENTE').toUpperCase().includes(activeFilters.status.toUpperCase());

        const matchesAgent = activeFilters.agent === 'TODOS' ||
            (item.agent || '').toUpperCase().includes(activeFilters.agent.toUpperCase());

        let matchesPeriod = true;
        if (activeFilters.period !== 'TODOS') {
            const dStr = item.endDate || item.startDate || item.date || item.dateGroup;
            if (dStr) {
                const parts = dStr.split('/');
                if (parts.length === 3) {
                    const date = new Date(parts[2], parts[1] - 1, parts[0]);
                    const now = new Date();
                    if (activeFilters.period === 'ESTA SEMANA') {
                        const diffDays = (date - now) / (1000 * 60 * 60 * 24);
                        matchesPeriod = diffDays >= -1 && diffDays <= 7;
                    } else if (activeFilters.period === 'ESTE MÊS') {
                        matchesPeriod = date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                    } else if (activeFilters.period === 'PERSONALIZADO' && activeRange.start && activeRange.end) {
                        const start = new Date(activeRange.start + 'T00:00:00');
                        const end = new Date(activeRange.end + 'T23:59:59');
                        matchesPeriod = date >= start && date <= end;
                    }
                }
            }
        }

        return matchesSearch && matchesResp && matchesStatus && matchesAgent && matchesPeriod;
    }).sort((a, b) => {
        const parseDate = (item) => {
            const dStr = item.startDate || item.endDate || item.date || item.dateGroup;
            if (!dStr) return new Date(2099, 11, 31);
            const iso = toInputDate(dStr);
            if (!iso) return new Date(2099, 11, 31);
            const [y, m, d] = iso.split('-').map(Number);
            const timeParts = (item.time || '00:00').split(':').map(Number);
            return new Date(y, m - 1, d, timeParts[0] || 0, timeParts[1] || 0);
        };
        return parseDate(a) - parseDate(b);
    });

    const checklistGroups = filteredTasks.reduce((acc, item) => {
        // Detect headers: items where responsible is missing and subject is in caps/bold-ish
        if (!item.responsible && item.subject && activeTab === 'checklist') { // Only treat as header if it's a checklist item and fits criteria
            acc.currentGroup = item.subject;
            if (!acc.groups[acc.currentGroup]) acc.groups[acc.currentGroup] = [];
        } else {
            const groupName = item.category || acc.currentGroup || 'OUTROS';
            if (!acc.groups[groupName]) acc.groups[groupName] = [];
            acc.groups[groupName].push(item);
        }
        return acc;
    }, { groups: {}, currentGroup: null }).groups;

    const timelineGroups = filteredTasks.reduce((acc, item) => {
        const date = item.date || item.dateGroup || item.startDate || 'Sem Data';
        if (!acc[date]) acc[date] = [];
        acc[date].push(item);
        return acc;
    }, {});

    const allItems = filteredTasks;

    const alertStats = filteredTasks.reduce((acc, item) => {
        const date = item.endDate || item.date || item.startDate;
        const isDelayed = isOverdue(date, item.status);
        const isNearing = !isDelayed && isNearExpiry(date, item.status);

        if (item.responsible) {
            const resp = item.responsible.toUpperCase();
            if (isDelayed) {
                const key = `EMPRESA:${resp}:ATRASADO`;
                if (!acc[key]) acc[key] = { title: resp, type: 'EMPRESA', delayed: 0, nearing: 0 };
                acc[key].delayed++;
            }
            if (isNearing) {
                const key = `EMPRESA:${resp}:ATENCAO`;
                if (!acc[key]) acc[key] = { title: resp, type: 'EMPRESA', delayed: 0, nearing: 0 };
                acc[key].nearing++;
            }
        }

        if (item.agent) {
            const agent = item.agent.toUpperCase();
            if (isDelayed) {
                const key = `AGENTE:${agent}:ATRASADO`;
                if (!acc[key]) acc[key] = { title: agent, type: 'AGENTE', delayed: 0, nearing: 0 };
                acc[key].delayed++;
            }
            if (isNearing) {
                const key = `AGENTE:${agent}:ATENCAO`;
                if (!acc[key]) acc[key] = { title: agent, type: 'AGENTE', delayed: 0, nearing: 0 };
                acc[key].nearing++;
            }
        }
        return acc;
    }, {});

    const handleAlertSelect = (title, type, status) => {
        setFilters(prev => ({
            ...prev,
            [activeTab]: {
                ...prev[activeTab],
                responsible: type === 'EMPRESA' ? title.toUpperCase() : 'TODOS',
                agent: type === 'AGENTE' ? title.toUpperCase() : 'TODOS',
                status: status.toUpperCase()
            }
        }));
    };

    const handleLogout = () => {
        localStorage.removeItem('mais_corp_rsvp_auth');
        localStorage.removeItem('mais_corp_user');
        window.location.reload();
    };

    const handleOpenImport = () => {
        setImportType('participants');
        setIsImportModalOpen(true);
    };

    const handleExportCSV = () => {
        const list = filteredTasks;
        if (list.length === 0) return alert('Nenhum dado para exportar.');

        const headers = activeTab === 'timeline'
            ? ['ID', 'Horário', 'Ação', 'Responsável', 'Agente', 'Data Início', 'Data Fim', 'Observações']
            : ['ID', 'Categoria', 'Assunto', 'Responsável', 'Agente', 'Status', 'Data Início', 'Data Fim', 'Observações'];

        const rows = list.map(item => {
            if (activeTab === 'timeline') {
                return [
                    item.id,
                    item.time || '',
                    item.action || '',
                    item.responsible || '',
                    item.agent || '',
                    formatDateBR(item.startDate || item.date),
                    formatDateBR(item.endDate || item.date),
                    (item.observation || '').replace(/\n/g, ' ')
                ];
            } else {
                return [
                    item.id,
                    item.category || '',
                    item.subject || '',
                    item.responsible || '',
                    item.agent || '',
                    item.status || '',
                    formatDateBR(item.startDate),
                    formatDateBR(item.endDate),
                    (item.observation || '').replace(/\n/g, ' ')
                ];
            }
        });

        const csvContent = [
            headers.join(';'),
            ...rows.map(row => row.map(cell => `"${cell?.toString().replace(/"/g, '""')}"`).join(';'))
        ].join('\n');

        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `relatorio_${activeTab}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportPDF = () => {
        window.print();
    };

    const filterCards = [
        { id: 'responsible', title: 'Empresa', icon: <LayoutDashboard className="w-4 h-4" />, options: ['TODOS', ...new Set([...(data?.checklist || []), ...(data?.timeline || [])].map(i => i.responsible?.trim()).filter(Boolean).map(r => r.toUpperCase()).filter(r => r !== 'TODOS'))] },
        { id: 'status', title: 'Status', icon: <ClipboardCheck className="w-4 h-4" />, options: ['TODOS', 'PENDENTE', 'EM ANDAMENTO', 'FINALIZADO', 'ATRASADO', 'ATENÇÃO', 'URGENTE'] },
        { id: 'agent', title: 'Agente', icon: <User className="w-4 h-4" />, options: ['TODOS', ...new Set([...(data?.checklist || []), ...(data?.timeline || [])].map(i => i.agent?.trim()).filter(Boolean).map(a => a.toUpperCase()).filter(a => a !== 'TODOS'))] },
        { id: 'period', title: 'Período', icon: <Calendar className="w-4 h-4" />, options: ['TODOS', 'ESTA SEMANA', 'ESTE MÊS', 'PERSONALIZADO'] }
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC] relative">
            {isLoading && (
                <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-[100] flex items-center justify-center">
                    <div className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-100 flex flex-col items-center gap-4">
                        <RefreshCw className="w-10 h-10 text-[#f37021] animate-spin" />
                        <p className="text-sm font-black text-slate-900 uppercase tracking-widest">Sincronizando...</p>
                    </div>
                </div>
            )}
            {showLogs && <SystemLogModal onClose={() => setShowLogs(false)} />}
            {selectedTask && (
                <TaskDetailsModal
                    task={selectedTask}
                    onClose={() => setSelectedTask(null)}
                    onSave={handleSaveTask}
                    onRefresh={onRefresh}
                    activeTab={activeTab}
                    checklistSections={checklistSections}
                    users={data?.users || []}
                />
            )}

            <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="h-20 flex items-center justify-between border-b border-slate-50">
                        <div className="flex items-center gap-6">
                            <button onClick={onBack} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                                <ArrowLeft className="w-6 h-6" />
                            </button>
                            <div className="flex items-center gap-4">
                                <div className="p-1 px-2 bg-slate-50 rounded-xl border border-slate-100 shadow-sm flex items-center justify-center min-w-[100px]">
                                    <img src="logo.png" alt="Mais Corporativo" className="h-10 w-auto object-contain" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-black text-slate-900 leading-none mb-1">Gestão Mallorca</h1>
                                    <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                        <FileText className="w-3 h-3 text-[#f37021]" />
                                        Powered by Mais Corporativo
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="hidden lg:flex items-center gap-4">
                            {(currentUser.role?.toUpperCase() || '').includes('ADMIN') && (
                                <button
                                    onClick={() => setShowLogs(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl transition-all border border-indigo-100 group"
                                >
                                    <Shield className="w-4 h-4 group-hover:animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Logs do Sistema</span>
                                </button>
                            )}
                            <div className="text-right px-4 border-l border-slate-100">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Sessão Identificada</div>
                                <div className="text-sm font-black text-slate-900 leading-none flex items-center gap-2 justify-end">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    {currentUser.name || 'Usuário'}
                                </div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-[#f37021] border border-slate-200 shadow-sm">
                                <User className="w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    <div className="h-16 flex items-center justify-between">
                        <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100 shadow-inner">
                            <button
                                onClick={() => setActiveTab('timeline')}
                                className={`px-8 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === 'timeline' ? 'bg-white shadow-md text-[#f37021] scale-[1.02]' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Cronograma
                            </button>
                            <button
                                onClick={() => setActiveTab('checklist')}
                                className={`px-8 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === 'checklist' ? 'bg-white shadow-md text-[#f37021] scale-[1.02]' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Checklist
                            </button>
                            {(currentUser.role?.toUpperCase() || '') === 'ADMIN' && (
                                <button
                                    onClick={() => setActiveTab('users')}
                                    className={`px-8 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === 'users' ? 'bg-white shadow-md text-[#f37021] scale-[1.02]' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Usuários
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            {(currentUser.role?.toUpperCase() || '') === 'ADMIN' && (
                                <button
                                    onClick={() => setIsImportModalOpen(true)}
                                    className="h-10 px-4 bg-slate-100 text-slate-600 font-bold rounded-xl flex items-center gap-2 hover:bg-slate-200 transition-all text-xs"
                                    title="Importar de Planilha"
                                >
                                    <Upload className="w-4 h-4" />
                                    <span className="hidden sm:inline">Importar</span>
                                </button>
                            )}
                            <button
                                onClick={handleLogout}
                                className="h-10 w-10 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all"
                                title="Sair"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-10">
                {activeTab === 'users' ? (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-3xl font-black text-slate-900">Gerenciamento de Usuários</h2>
                            <button
                                onClick={() => {
                                    setSelectedUser({ username: '', pin: '', name: '', role: 'USER', email: '' });
                                    setIsUserModalOpen(true);
                                }}
                                className="px-6 py-3 bg-[#f37021] text-white rounded-2xl font-black shadow-lg shadow-orange-200 flex items-center gap-3"
                            >
                                <Plus className="w-5 h-5" /> Adicionar Usuário
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {(data.users || []).map(u => (
                                <div key={u.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-4 rounded-2xl ${u.role === 'ADMIN' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}>
                                                {u.role === 'ADMIN' ? <ShieldCheck className="w-6 h-6" /> : <User className="w-6 h-6" />}
                                            </div>
                                            <div>
                                                <h3 className="font-black text-slate-800">{u.name}</h3>
                                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{u.role}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => { setSelectedUser(u); setIsUserModalOpen(true); }}
                                                className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-blue-500"
                                            >
                                                <Settings className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(u.id)}
                                                className="p-2 hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-500"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2 mt-4 pt-4 border-t border-slate-50">
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                            <User className="w-3 h-3" /> Login: <span className="text-slate-700 font-black">{u.username}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                            <Mail className="w-3 h-3" /> {u.email || 'Sem e-mail'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                            <div className="flex-1 w-full relative group">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-[#f37021] transition-colors" />
                                <input
                                    type="text"
                                    placeholder={activeTab === 'timeline' ? "Buscar ação ou responsável..." : "Buscar assunto ou responsável..."}
                                    className="w-full pl-14 pr-[280px] py-5 bg-white border-2 border-slate-100 rounded-[2rem] shadow-sm focus:ring-4 focus:ring-orange-500/10 focus:border-[#f37021] transition-all font-bold text-slate-600 text-lg placeholder:text-slate-300"
                                    value={searchQuery[activeTab]}
                                    onChange={(e) => setSearchQuery(prev => ({ ...prev, [activeTab]: e.target.value }))}
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                    <button
                                        onClick={handleExportCSV}
                                        title="Exportar Excel/CSV"
                                        className="p-3 bg-emerald-50 text-emerald-600 rounded-[1.2rem] font-black text-sm hover:bg-emerald-100 transition-all no-print"
                                    >
                                        <Download className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={handleExportPDF}
                                        title="Gerar PDF / Imprimir"
                                        className="p-3 bg-blue-50 text-blue-600 rounded-[1.2rem] font-black text-sm hover:bg-blue-100 transition-all no-print"
                                    >
                                        <Printer className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={handleAddTask}
                                        className="flex items-center gap-2 px-6 py-3 bg-[#f37021] text-white rounded-[1.5rem] font-black text-sm shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all no-print"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Nova
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Alertas Visuais solicitados pelo usuário - Apenas se houver alertas */}
                        {(() => {
                            const delayedCount = filteredTasks.filter(i => isOverdue(i.endDate || i.startDate || i.date, i.status)).length;
                            const nearingCount = filteredTasks.filter(i => isNearExpiry(i.endDate || i.startDate || i.date, i.status)).length;

                            if (delayedCount === 0 && nearingCount === 0) return null;

                            return (
                                <div className="mb-12 flex flex-wrap gap-6 no-print">
                                    {delayedCount > 0 && (
                                        <AlertCard
                                            title="Tarefas Atrasadas"
                                            type="CRÍTICO"
                                            delayed={delayedCount}
                                            nearing={0}
                                            onSelect={handleAlertSelect}
                                        />
                                    )}
                                    {nearingCount > 0 && (
                                        <AlertCard
                                            title="Próximo do Vencimento (3 dias)"
                                            type="ATENÇÃO"
                                            delayed={0}
                                            nearing={nearingCount}
                                            onSelect={handleAlertSelect}
                                        />
                                    )}
                                </div>
                            );
                        })()}

                        <a
                            href="https://docs.google.com/spreadsheets/d/1ElaCulhoy8ptGEo8jFRbl6_CFyR09hKf/edit?usp=sharing&ouid=110754108347191960094&rtpof=true&sd=true"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 text-xs font-black text-indigo-600 hover:text-indigo-700 transition-all uppercase tracking-widest mb-10 no-print group w-fit mx-auto bg-indigo-50/50 hover:bg-indigo-50 px-6 py-3 rounded-2xl border border-indigo-100/50 hover:border-indigo-200 shadow-sm hover:shadow-md"
                        >
                            <FileText className="w-4 h-4" />
                            <span>Acesse a versão planilha do Day by Day!</span>
                            <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </a>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10 no-print">
                            {filterCards.map((card, idx) => (
                                <div key={card.id} className="bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-sm">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center">
                                            {card.icon}
                                        </div>
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{card.title}</h4>
                                    </div>
                                    <div className="space-y-3">
                                        <select
                                            value={activeFilters[card.id]}
                                            onChange={(e) => setFilters(prev => ({
                                                ...prev,
                                                [activeTab]: { ...prev[activeTab], [card.id]: e.target.value }
                                            }))}
                                            className="w-full bg-slate-50 border-none rounded-xl px-3 py-2 text-xs font-black text-slate-700 focus:ring-2 focus:ring-slate-100 outline-none"
                                        >
                                            {card.options.map((opt, idx) => <option key={`${card.id}-${opt}-${idx}`} value={opt}>{opt}</option>)}
                                        </select>

                                        {card.id === 'period' && activeFilters.period === 'PERSONALIZADO' && (
                                            <div className="grid grid-cols-2 gap-2 mt-2">
                                                <input
                                                    type="date"
                                                    value={activeRange.start}
                                                    onChange={(e) => setDateRange(prev => ({
                                                        ...prev,
                                                        [activeTab]: { ...prev[activeTab], start: e.target.value }
                                                    }))}
                                                    className="bg-slate-50 border-none rounded-lg px-2 py-1 text-[10px] font-bold text-slate-600 focus:ring-1 focus:ring-orange-200 outline-none"
                                                />
                                                <input
                                                    type="date"
                                                    value={activeRange.end}
                                                    onChange={(e) => setDateRange(prev => ({
                                                        ...prev,
                                                        [activeTab]: { ...prev[activeTab], end: e.target.value }
                                                    }))}
                                                    className="bg-slate-50 border-none rounded-lg px-2 py-1 text-[10px] font-bold text-slate-600 focus:ring-1 focus:ring-orange-200 outline-none"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {activeTab === 'timeline' ? (
                            <div className="max-w-4xl mx-auto pb-20">
                                {Object.entries(timelineGroups)
                                    .sort(([dateA], [dateB]) => {
                                        const parseDate = (dStr) => {
                                            if (!dStr || typeof dStr !== 'string') return new Date(2099, 11, 31);
                                            const iso = toInputDate(dStr);
                                            if (!iso) return new Date(2099, 11, 31);
                                            const [y, m, d] = iso.split('-').map(Number);
                                            return new Date(y, m - 1, d);
                                        };
                                        return parseDate(dateA) - parseDate(dateB);
                                    })
                                    .map(([date, items]) => (
                                        <div key={date} className="mb-14">
                                            <div className="flex items-center gap-6 mb-8">
                                                <div className="px-5 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg shadow-slate-200">{formatDateBR(date)}</div>
                                                <div className="flex-1 h-px bg-slate-200"></div>
                                            </div>
                                            <div className="space-y-2">
                                                {items.map(item => <TimelineItem key={item.id} item={item} onSelect={setSelectedTask} onMove={handleMoveTask} />)}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        ) : (
                            <div className="space-y-12 pb-20">
                                {Object.entries(checklistGroups).map(([groupName, items]) => {
                                    const isOpen = openGroups[groupName];
                                    return (
                                        <div key={groupName} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
                                            <div
                                                className="px-8 py-6 bg-slate-100 border-b-2 border-slate-200 flex items-center justify-between cursor-pointer select-none"
                                                onClick={() => toggleGroup(groupName)}
                                            >
                                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                                                    <div className="w-2 h-6 bg-[#f37021] rounded-full"></div>
                                                    {groupName}
                                                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                                                </h3>
                                                <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-black text-slate-400">
                                                    {items.length} {items.length === 1 ? 'Tarefa' : 'Tarefas'}
                                                </span>
                                            </div>
                                            <div className={`divide-y divide-slate-50 transition-all duration-300 ${isOpen ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                                                {items.length === 0 ? (
                                                    <div className="p-10 text-center text-slate-300 italic text-sm">Nenhuma tarefa visível sob este título com os filtros atuais.</div>
                                                ) : (
                                                    items.map(item => {
                                                        const overdue = isOverdue(item.endDate, item.status);
                                                        return (
                                                            <div
                                                                key={item.id}
                                                                className="group hover:bg-slate-50/80 transition-all cursor-pointer p-6 md:px-8 flex flex-col md:flex-row md:items-center justify-between gap-6"
                                                                onClick={() => setSelectedTask(item)}
                                                            >
                                                                <div className="flex-1 min-w-0">
                                                                    <div className={`font-black text-base group-hover:text-indigo-600 transition-colors ${overdue ? 'text-red-600' : 'text-slate-800'}`}>
                                                                        {item.action || item.subject}
                                                                    </div>
                                                                    <div className="flex items-center gap-4 mt-2">
                                                                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                                                                            <Calendar className="w-3 h-3 text-[#f37021]" />
                                                                            {item.startDate && item.endDate && item.startDate !== item.endDate
                                                                                ? `${formatDateBR(item.startDate)} → ${formatDateBR(item.endDate)}`
                                                                                : formatDateBR(item.endDate || item.startDate || 'Sem data')}
                                                                        </div>
                                                                        <ResponsibleTag name={item.responsible} />
                                                                        {item.agent && (
                                                                            <div className="flex items-center gap-1.5 text-[9px] font-black text-teal-600 uppercase tracking-widest">
                                                                                <User className="w-3 h-3" />
                                                                                {item.agent}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-4">
                                                                    <div className="flex flex-col gap-1 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); handleMoveTask(item.id, 'up', 'checklist'); }}
                                                                            className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-[#f37021] transition-all"
                                                                            title="Subir Tarefa"
                                                                        >
                                                                            <ChevronUp className="w-4 h-4" />
                                                                        </button>
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); handleMoveTask(item.id, 'down', 'checklist'); }}
                                                                            className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-[#f37021] transition-all"
                                                                            title="Descer Tarefa"
                                                                        >
                                                                            <ChevronDown className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                    <StatusBadge status={item.status} date={item.endDate} />
                                                                    <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </main>

            <style>{`
                @media print {
                    .no-print, button, header, .mb-12, .grid-cols-2, .lg:grid-cols-4 {
                        display: none !important;
                    }
                    body {
                        background: white !important;
                        padding: 0 !important;
                    }
                    main {
                        max-width: 100% !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    .bg-white {
                        box-shadow: none !important;
                        border: 1px solid #e2e8f0 !important;
                    }
                    .rounded-[2.5rem], .rounded-3xl {
                        border-radius: 8px !important;
                    }
                    .shadow-xl, .shadow-md, .shadow-sm {
                        box-shadow: none !important;
                    }
                    .max-h-0 {
                        max-height: none !important;
                        opacity: 1 !important;
                        overflow: visible !important;
                    }
                    .divide-y > * {
                        page-break-inside: avoid;
                    }
                    h3 {
                        background-color: #f1f5f9 !important;
                        -webkit-print-color-adjust: exact;
                        padding: 10px !important;
                        margin-top: 20px !important;
                    }
                }
            `}</style>
            {/* Import Modal */}
            {isImportModalOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl relative">
                        <button 
                            onClick={() => setIsImportModalOpen(false)}
                            className="absolute right-6 top-6 p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="mb-8">
                            <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mb-6">
                                <Upload className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 mb-2">Importar Dados</h2>
                            <p className="text-slate-500 font-medium italic text-sm">Selecione uma planilha (CSV) para importar para o sistema.</p>
                        </div>
                        
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <button
                                    onClick={() => setImportType('participants')}
                                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${importType === 'participants' ? 'border-orange-500 bg-orange-50' : 'border-slate-100'}`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${importType === 'participants' ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest">Participantes</span>
                                </button>
                                <button
                                    onClick={() => setImportType('tasks')}
                                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${importType === 'tasks' ? 'border-orange-500 bg-orange-50' : 'border-slate-100'}`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${importType === 'tasks' ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                        <Briefcase className="w-5 h-5" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest">Tarefas Mestra</span>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <label className="block p-10 border-2 border-dashed border-slate-200 rounded-[2rem] hover:border-orange-500 hover:bg-orange-50 transition-all cursor-pointer text-center group">
                                    <input
                                        type="file"
                                        accept=".csv"
                                        onChange={handleImportFile}
                                        className="hidden"
                                    />
                                    <div className="mb-4 relative">
                                        <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto group-hover:bg-white group-hover:shadow-lg transition-all">
                                            <Plus className="w-6 h-6 text-slate-400 group-hover:text-orange-500" />
                                        </div>
                                    </div>
                                    <span className="block font-black text-slate-600 uppercase text-xs tracking-widest mb-1">Selecionar Arquivo</span>
                                    <span className="text-[10px] text-slate-400 font-bold">FORMATO CSV APENAS</span>
                                </label>
                                
                                <button
                                    onClick={() => setIsImportModalOpen(false)}
                                    className="w-full py-4 text-slate-400 font-black uppercase text-[10px] tracking-[0.2em] hover:text-slate-600 transition-all"
                                >
                                    Cancelar Operação
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            {/* User Management Modal */}
            {isUserModalOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl relative">
                        <button 
                            onClick={() => setIsUserModalOpen(false)}
                            className="absolute right-6 top-6 p-2 hover:bg-slate-50 rounded-full text-slate-400"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        
                        <h2 className="text-2xl font-black text-slate-900 mb-6">
                            {selectedUser?.id ? 'Editar Usuário' : 'Novo Usuário'}
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Nome Completo</label>
                                <input 
                                    className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500/20"
                                    value={selectedUser?.name}
                                    onChange={e => setSelectedUser({...selectedUser, name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">E-mail para Alertas</label>
                                <input 
                                    className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500/20"
                                    value={selectedUser?.email}
                                    onChange={e => setSelectedUser({...selectedUser, email: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Username</label>
                                    <input 
                                        className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500/20"
                                        value={selectedUser?.username}
                                        onChange={e => setSelectedUser({...selectedUser, username: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">PIN (Senha)</label>
                                    <input 
                                        className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500/20"
                                        value={selectedUser?.pin}
                                        onChange={e => setSelectedUser({...selectedUser, pin: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Perfil de Acesso</label>
                                <select 
                                    className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500/20 appearance-none"
                                    value={selectedUser?.role}
                                    onChange={e => setSelectedUser({...selectedUser, role: e.target.value})}
                                >
                                    <option value="USER">USUÁRIO COMUM</option>
                                    <option value="ADMIN">ADMINISTRADOR</option>
                                </select>
                            </div>

                            <button
                                onClick={() => handleSaveUser(selectedUser)}
                                className="w-full bg-[#f37021] text-white py-4 rounded-2xl font-black shadow-lg shadow-orange-200 mt-4 transition-all hover:bg-orange-600"
                            >
                                Salvar Usuário
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
