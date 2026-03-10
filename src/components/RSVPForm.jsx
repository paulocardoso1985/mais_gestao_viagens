import React, { useState } from 'react';
import { X, User, Plane, ShieldAlert, Phone, Save, Users, CreditCard, Calendar, Globe, MapPin, CheckCircle2 } from 'lucide-react';

export default function RSVPForm({ isOpen, onClose, onSuccess, isAdmin = false, participants = [] }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        type: 'Titular',
        name: '',
        email: '',
        phone: '',
        cpf: '',
        birthday: '',
        gender: '',
        nationality: 'BRASILEIRA',
        passport: '',
        passportIssueDate: '',
        passportExpiryDate: '',
        usVisa: 'Não',
        usVisaExpiry: '',
        city: '',
        uf: '',
        airport: '',
        tour: 'Pendente',
        allergies: '',
        restrictions: '',
        medicalConditions: '',
        mobilityAssistance: 'Não',
        mobilityDetails: '',
        emergencyName: '',
        emergencyRelationship: '',
        emergencyPhone: '',
        titularName: '',
        status: 'Confirmado'
    });

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/participants', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Erro ao salvar');

            onSuccess?.();
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[1100] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col relative">
                
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">
                            {isAdmin ? 'Adicionar Participante' : 'Formulário RSVP Mallorca 2026'}
                        </h2>
                        <p className="text-slate-500 text-sm">Preencha todos os campos obrigatórios para confirmar a participação.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold">
                            <ShieldAlert className="w-5 h-5" />
                            {error}
                        </div>
                    )}

                    <div className="space-y-8">
                        {/* Seção 1: Dados Pessoais */}
                        <section>
                            <div className="flex items-center gap-3 mb-6 text-[#f37021]">
                                <User className="w-5 h-5" />
                                <h3 className="font-bold uppercase tracking-wider text-xs">Dados Pessoais</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Nome Completo</label>
                                    <input required name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-[#f37021] outline-none transition-all font-medium" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Tipo</label>
                                    <select name="type" value={formData.type} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-medium">
                                        <option value="Titular">Titular</option>
                                        <option value="Acompanhante">Acompanhante</option>
                                    </select>
                                </div>
                                {formData.type === 'Acompanhante' && (
                                    <div className="md:col-span-3">
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Vincular ao Titular</label>
                                        <select required name="titularName" value={formData.titularName} onChange={handleChange} className="w-full px-4 py-3 bg-[#fdf2f2] border border-red-100 rounded-xl outline-none font-bold text-red-900">
                                            <option value="">Selecione o Titular responsável...</option>
                                            {participants.filter(p => p.type === 'Titular').map(p => (
                                                <option key={p.id} value={p.name}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">CPF</label>
                                    <input required name="cpf" value={formData.cpf} onChange={handleChange} placeholder="000.000.000-00" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-orange-500/20 outline-none font-medium" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Data de Nascimento</label>
                                    <input required name="birthday" type="text" placeholder="DD/MM/AAAA" value={formData.birthday} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-medium" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Gênero</label>
                                    <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-medium">
                                        <option value="">Selecione...</option>
                                        <option value="Masculino">Masculino</option>
                                        <option value="Feminino">Feminino</option>
                                        <option value="Outro">Outro</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">E-mail</label>
                                    <input required name="email" type="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-medium" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Telefone</label>
                                    <input required name="phone" value={formData.phone} onChange={handleChange} placeholder="(00) 00000-0000" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-medium" />
                                </div>
                            </div>
                        </section>

                        {/* Seção 2: Documentação */}
                        <section className="bg-blue-50/30 p-6 rounded-3xl border border-blue-50">
                            <div className="flex items-center gap-3 mb-6 text-blue-600">
                                <CreditCard className="w-5 h-5" />
                                <h3 className="font-bold uppercase tracking-wider text-xs">Documentação de Viagem</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Número do Passaporte</label>
                                    <input required name="passport" value={formData.passport} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-blue-100 rounded-xl outline-none font-bold uppercase" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Data de Emissão</label>
                                    <input name="passportIssueDate" placeholder="DD/MM/AAAA" value={formData.passportIssueDate} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-blue-100 rounded-xl outline-none font-medium" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Data de Validade</label>
                                    <input required name="passportExpiryDate" placeholder="DD/MM/AAAA" value={formData.passportExpiryDate} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-blue-100 rounded-xl outline-none font-medium" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Possui Visto Americano?</label>
                                    <select name="usVisa" value={formData.usVisa} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-blue-100 rounded-xl outline-none font-bold">
                                        <option value="Não">Não</option>
                                        <option value="Sim">Sim</option>
                                    </select>
                                </div>
                                {formData.usVisa === 'Sim' && (
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Validade do Visto</label>
                                        <input name="usVisaExpiry" placeholder="DD/MM/AAAA" value={formData.usVisaExpiry} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-blue-100 rounded-xl outline-none font-medium" />
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Seção 3: Logística e Passeios */}
                        <section>
                            <div className="flex items-center gap-3 mb-6 text-indigo-600">
                                <Plane className="w-5 h-5" />
                                <h3 className="font-bold uppercase tracking-wider text-xs">Logística e Experiência</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Escolha seu Passeio em Mallorca</label>
                                    <select name="tour" value={formData.tour} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-indigo-900">
                                        <option value="Pendente">Ainda não decidi</option>
                                        <option value="City Tour">City Tour em Palma</option>
                                        <option value="Cavernas Drach">Cavernas Drach</option>
                                        <option value="Tarde Livre">Manhã Livre / Tarde com o Grupo</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Cidade de Origem (Voo)</label>
                                    <input required name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-medium" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Estado (UF)</label>
                                    <input required name="uf" maxLength="2" value={formData.uf} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-medium uppercase" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Código Aeroporto</label>
                                    <input required name="airport" maxLength="3" value={formData.airport} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-medium uppercase" />
                                </div>
                            </div>
                        </section>

                        {/* Seção 4: Saúde e Emergência */}
                        <section className="bg-red-50/30 p-6 rounded-3xl border border-red-50">
                            <div className="flex items-center gap-3 mb-6 text-red-600">
                                <ShieldAlert className="w-5 h-5" />
                                <h3 className="font-bold uppercase tracking-wider text-xs">Saúde e Emergência</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Alergias ou Restrições Alimentares</label>
                                        <textarea name="allergies" value={formData.allergies} onChange={handleChange} rows="2" className="w-full px-4 py-3 bg-white border border-red-100 rounded-xl outline-none text-sm" placeholder="Descreva aqui se houver..."></textarea>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1">
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Necessita de Auxílio Mobilidade?</label>
                                            <select name="mobilityAssistance" value={formData.mobilityAssistance} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-red-100 rounded-xl outline-none font-bold">
                                                <option value="Não">Não</option>
                                                <option value="Sim">Sim</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="bg-white p-4 rounded-2xl border border-red-100 shadow-sm">
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1 flex items-center gap-2">
                                            <Phone className="w-3 h-3" /> Contato de Emergência
                                        </label>
                                        <div className="space-y-3">
                                            <input required name="emergencyName" value={formData.emergencyName} onChange={handleChange} placeholder="Nome do Contato" className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg outline-none text-sm font-bold" />
                                            <div className="grid grid-cols-2 gap-2">
                                                <input required name="emergencyRelationship" value={formData.emergencyRelationship} onChange={handleChange} placeholder="Parentesco" className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg outline-none text-sm" />
                                                <input required name="emergencyPhone" value={formData.emergencyPhone} onChange={handleChange} placeholder="Telefone" className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg outline-none text-sm font-bold" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Footer / Submit */}
                    <div className="mt-12 mb-4">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-[#f37021] hover:bg-orange-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    {isAdmin ? 'Cadastrar e Salvar' : 'Confirmar e Enviar RSVP'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
