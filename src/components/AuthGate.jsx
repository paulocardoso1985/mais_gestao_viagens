import React, { useState, useEffect } from 'react';
import { Lock, ShieldCheck, ArrowRight, ShieldAlert, Loader2, KeyRound, CheckCircle2, ChevronLeft } from 'lucide-react';
import { fetchUsers, changePINRemote } from '../services/api';

export default function AuthGate({ children }) {
    const [mode, setMode] = useState('login'); // 'login' or 'changePIN'
    const [users, setUsers] = useState([]);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [fetchingUsers, setFetchingUsers] = useState(true);

    const loadUsers = async () => {
        setFetchingUsers(true);
        try {
            const fetchedUsers = await fetchUsers();
            if (fetchedUsers && fetchedUsers.length > 0) {
                setUsers(fetchedUsers);
            }
        } catch (err) {
            console.error("Failed to load users:", err);
        } finally {
            setFetchingUsers(false);
            setLoading(false);
        }
    };

    useEffect(() => {
        const init = async () => {
            const savedAuth = localStorage.getItem('mais_corp_rsvp_auth');
            const user = localStorage.getItem('mais_corp_user');
            if (savedAuth === 'true' && user) {
                setIsAuthenticated(true);
            }
            await loadUsers();
        };
        init();
    }, []);

    const handleLogin = (e) => {
        e.preventDefault();
        const login = username.toLowerCase().trim();
        const foundUser = users.find(u =>
            (String(u.username).toLowerCase() === login || String(u.name).toLowerCase() === login) &&
            String(u.pin).trim() === String(password).trim()
        );

        if (foundUser) {
            setIsAuthenticated(true);
            localStorage.setItem('mais_corp_rsvp_auth', 'true');
            localStorage.setItem('mais_corp_user', JSON.stringify(foundUser));
            setError('');
        } else {
            setError('Credenciais incorretas');
            setTimeout(() => setError(''), 2000);
        }
    };

    const handleUpdatePIN = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('Os PINs não coincidem');
            return;
        }
        if (newPassword.length < 4) {
            setError('O PIN deve ter pelo menos 4 dígitos');
            return;
        }

        setIsProcessing(true);
        const login = username.toLowerCase().trim();
        const foundUser = users.find(u =>
            (String(u.username).toLowerCase() === login || String(u.name).toLowerCase() === login) &&
            String(u.pin).trim() === String(password).trim()
        );

        if (!foundUser) {
            setError('Login ou PIN atual incorreto');
            setIsProcessing(false);
            return;
        }

        const result = await changePINRemote(foundUser.username, newPassword);
        if (result.success) {
            setSuccess('PIN alterado com sucesso!');
            setError('');
            setTimeout(async () => {
                await loadUsers();
                setMode('login');
                setSuccess('');
                setPassword('');
                setNewPassword('');
                setConfirmPassword('');
            }, 2000);
        } else {
            setError('Erro ao atualizar. Tente novamente.');
        }
        setIsProcessing(false);
    };

    if (loading) return null;

    if (isAuthenticated) {
        return children;
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 selection:bg-[#f37021]/30">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#f37021]/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-600/5 blur-[120px] rounded-full"></div>
            </div>

            <div className="w-full max-w-md relative">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#f37021] via-orange-400 to-[#f37021]"></div>

                    <div className="flex flex-col items-center text-center mb-10">
                        <div className="mb-8 p-4 bg-white/10 rounded-3xl backdrop-blur-sm shadow-xl border border-white/5 transition-transform hover:scale-105 duration-500">
                            <img src="logo.png" alt="Mais Corporativo Logo" className="h-16 w-auto" />
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tight mb-3 uppercase">
                            {mode === 'login' ? 'Acesso Restrito' : 'Definir PIN'}
                        </h1>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider leading-relaxed max-w-[280px]">
                            {mode === 'login'
                                ? <>Insira a chave de acesso <span className="text-[#f37021]">Mais Corporativo</span> para continuar.</>
                                : 'Configure seu PIN individual para garantir a segurança dos seus dados.'
                            }
                        </p>
                    </div>

                    <form onSubmit={mode === 'login' ? handleLogin : handleUpdatePIN} className="space-y-6">
                        <div className="space-y-4">
                            <div className="relative group">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2 mb-2 block">
                                    Login de Usuário
                                </label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value.toLowerCase())}
                                    placeholder="Seu login"
                                    className="w-full bg-white/10 border border-white/10 group-hover:border-white/30 focus:bg-white/20 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-4 focus:ring-[#f37021]/20 focus:border-[#f37021] transition-all duration-300 font-bold placeholder-slate-600 outline-none"
                                />
                            </div>

                            <div className="relative group">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2 mb-2 block">
                                    {mode === 'login' ? 'PIN Individual' : 'PIN Atual / Temporário'}
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/10 border border-white/10 group-hover:border-white/30 focus:bg-white/20 rounded-2xl px-6 py-4 text-white placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-[#f37021]/20 focus:border-[#f37021] transition-all duration-300 font-bold"
                                    placeholder="••••"
                                    maxLength={4}
                                />
                            </div>

                            {mode === 'changePIN' && (
                                <>
                                    <div className="relative group animate-in slide-in-from-top-2 duration-300">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2 mb-2 block text-[#f37021]">
                                            Novo PIN
                                        </label>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full bg-white/10 border border-[#f37021]/30 focus:border-[#f37021] rounded-2xl px-6 py-4 text-white placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-[#f37021]/20 transition-all font-bold"
                                            placeholder="••••"
                                            maxLength={4}
                                        />
                                    </div>
                                    <div className="relative group animate-in slide-in-from-top-2 duration-500">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2 mb-2 block text-[#f37021]">
                                            Confirmar Novo PIN
                                        </label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full bg-white/10 border border-[#f37021]/30 focus:border-[#f37021] rounded-2xl px-6 py-4 text-white placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-[#f37021]/20 transition-all font-bold"
                                            placeholder="••••"
                                            maxLength={4}
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        {error && (
                            <div className="flex items-center gap-1.5 text-red-500 text-[10px] font-black uppercase bg-red-500/10 p-3 rounded-xl border border-red-500/20 animate-in fade-in slide-in-from-top-1">
                                <ShieldAlert className="w-3 h-3" /> {error}
                            </div>
                        )}

                        {success && (
                            <div className="flex items-center gap-1.5 text-green-500 text-[10px] font-black uppercase bg-green-500/10 p-3 rounded-xl border border-green-500/20 animate-in fade-in slide-in-from-top-1">
                                <CheckCircle2 className="w-3 h-3" /> {success}
                            </div>
                        )}

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isProcessing || fetchingUsers || !username || !password || (mode === 'changePIN' && (!newPassword || !confirmPassword))}
                                className="w-full bg-[#f37021] text-white hover:bg-orange-600 disabled:opacity-30 disabled:cursor-not-allowed font-black py-4 rounded-2xl shadow-xl shadow-[#f37021]/20 transition-all duration-300 flex items-center justify-center gap-2 group active:scale-[0.98] px-6 uppercase tracking-widest text-xs"
                            >
                                {isProcessing || fetchingUsers
                                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Processando...</>
                                    : mode === 'login' ? <>Entrar no Sistema <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" /></> : 'Confirmar Novo PIN'
                                }
                            </button>

                            {mode === 'login' ? (
                                <button
                                    type="button"
                                    onClick={() => setMode('changePIN')}
                                    className="w-full mt-4 text-[10px] font-black text-slate-500 hover:text-[#f37021] uppercase tracking-widest transition-colors flex items-center justify-center gap-2 group"
                                >
                                    <KeyRound className="w-3 h-3 transition-transform group-hover:rotate-12" />
                                    Primeiro Acesso / Alterar PIN
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setMode('login')}
                                    className="w-full mt-4 text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors flex items-center justify-center gap-2 group"
                                >
                                    <ChevronLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" />
                                    Voltar para o Login
                                </button>
                            )}
                        </div>
                    </form>

                    <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-center gap-2 text-slate-500">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-[10px] uppercase font-bold tracking-widest">Segurança Mais Corporativo</span>
                    </div>
                </div>

                <div className="mt-8 flex items-center justify-center gap-3 opacity-40 hover:opacity-100 transition-opacity duration-500 cursor-default">
                    <img src="logo.png" alt="Mais Corporativo" className="h-6 w-auto opacity-70" />
                    <span className="text-white text-[10px] font-bold tracking-wider uppercase border-l border-white/20 pl-3">RSVP Manager</span>
                </div>
            </div>
        </div>
    );
}
