"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Check, X, MapPin, UserCircle, Calendar, IdentificationCard, Phone, House } from "phosphor-react";
import Image from "next/image";

export default function PerfilPage() {
  const { user, authenticated, loading } = useAuth();
  const router = useRouter();

  type EditFields = {
    display_name: boolean;
    phone: boolean;
    cpf: boolean;
    birth_date: boolean;
    address: boolean;
  };
  type FormFields = {
    display_name: string;
    phone: string;
    cpf: string;
    birth_date: string;
    address: string;
  };

  const [edit, setEdit] = useState<EditFields>({
    display_name: false,
    phone: false,
    cpf: false,
    birth_date: false,
    address: false,
  });
  const [form, setForm] = useState<FormFields>({
    display_name: (user as any)?.display_name || "",
    phone: user?.phone || "",
    cpf: user?.cpf || "",
    birth_date: user?.birth_date || "",
    address: (user as any)?.address || "",
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !authenticated) {
      router.replace("/login");
    }
  }, [authenticated, loading, router]);

  useEffect(() => {
    setForm({
      display_name: (user as any)?.display_name || "",
      phone: user?.phone || "",
      cpf: user?.cpf || "",
      birth_date: user?.birth_date || "",
      address: (user as any)?.address || "",
    });
  }, [user]);

  if (loading || !user) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-dark-950">
        <div className="w-full max-w-4xl bg-dark-900 border border-dark-800 rounded-3xl shadow-2xl p-0 md:p-10 flex flex-col gap-8 animate-pulse">
          {/* Skeleton do topo */}
          <div className="flex flex-col items-center justify-center gap-2 bg-dark-900 rounded-t-3xl p-8 border-b border-dark-800">
            <div className="h-8 w-48 bg-dark-800 rounded mb-3" />
            <div className="h-5 w-40 bg-dark-800 rounded mb-2" />
            <div className="h-4 w-32 bg-dark-800 rounded" />
          </div>
          {/* Skeleton dos cards */}
          <div className="w-full flex flex-col gap-6 p-4 md:p-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-dark-800 rounded-xl p-5 h-20 flex items-center gap-4 shadow">
                  <div className="h-8 w-8 bg-dark-900 rounded-full flex-shrink-0" />
                  <div className="flex-1 h-5 bg-dark-900 rounded" />
                </div>
              ))}
            </div>
            {/* Endereço skeleton */}
            <div>
              <div className="bg-dark-800 rounded-xl p-5 h-20 flex items-center gap-4 shadow w-full">
                <div className="h-8 w-8 bg-dark-900 rounded-full flex-shrink-0" />
                <div className="flex-1 h-5 bg-dark-900 rounded" />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  async function handleSave(field: keyof FormFields) {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/auth/update-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: form[field] || null }),
      });
      const data = await res.json();
      if (data.success) {
        setEdit((e) => ({ ...e, [field]: false }));
        setSuccess("Alteração salva com sucesso!");
        setTimeout(() => setSuccess(""), 2000);
      } else {
        setError(data.message || "Erro ao salvar. Tente novamente.");
      }
    } catch {
      setError("Erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  return (
    <section className="min-h-screen w-full flex flex-col items-center justify-center bg-dark-950 py-12 px-2 md:px-8">
      <motion.div 
        className="w-full max-w-4xl bg-dark-900 border border-dark-800 rounded-3xl shadow-2xl p-0 md:p-10 flex flex-col gap-8"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ 
          duration: 0.6, 
          ease: "easeOut",
          delay: 0.1
        }}
      >
        {/* Nova apresentação do topo do perfil */}
        <motion.div 
          className="flex flex-col items-center justify-center gap-2 bg-dark-900 rounded-t-3xl p-8 border-b border-dark-800"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.5, 
            ease: "easeOut",
            delay: 0.3
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl md:text-3xl font-extrabold text-white">Olá,</span>
            {edit.display_name ? (
              <>
                <input
                  name="display_name"
                  value={form.display_name}
                  onChange={handleChange}
                  className="px-2 py-1 rounded-lg border-2 border-primary-500 bg-dark-900 text-white focus:border-primary-400 outline-none transition-all text-2xl md:text-3xl font-extrabold w-48 text-center"
                  placeholder="Seu nome de exibição"
                  maxLength={50}
                  autoFocus
                />
                <span className="text-2xl md:text-3xl font-extrabold text-white">!</span>
                <button onClick={() => handleSave('display_name')} className="ml-1 text-green-400 hover:text-green-500" title="Aplicar"><Check size={20} /></button>
                <button onClick={() => setEdit((e) => ({ ...e, display_name: false }))} className="ml-1 text-red-400 hover:text-red-500" title="Cancelar"><X size={20} /></button>
              </>
            ) : (
              <span className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-1">
                {(form.display_name || user.name) + "!"}
                <button onClick={() => setEdit((e) => ({ ...e, display_name: true }))} className="ml-1 text-primary-400 hover:text-primary-300" title="Editar nome de exibição"><i className="fa-solid fa-pen-to-square text-lg"></i></button>
              </span>
            )}
          </div>
          <span className="text-gray-400 text-base md:text-lg break-all text-center max-w-full">{user.email}</span>
        </motion.div>

        {/* Dados do usuário */}
        <motion.div 
          className="w-full flex flex-col gap-6 p-4 md:p-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ 
            duration: 0.5, 
            ease: "easeOut",
            delay: 0.5
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Linha 1 */}
            <motion.div 
              className="bg-dark-800 rounded-xl p-5 flex items-start gap-4 shadow min-h-[80px]"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                duration: 0.5, 
                ease: "easeOut",
                delay: 0.6
              }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <IdentificationCard size={28} className="text-primary-400 flex-shrink-0 mt-1" />
              <div className="flex-1 min-w-0">
                <span className="text-gray-400 text-xs">Nome</span>
                <div className="text-white font-bold text-lg break-words">{user.name}</div>
              </div>
            </motion.div>
            <motion.div 
              className="bg-dark-800 rounded-xl p-5 flex items-start gap-4 shadow min-h-[80px]"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                duration: 0.5, 
                ease: "easeOut",
                delay: 0.7
              }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Calendar size={28} className="text-primary-400 flex-shrink-0 mt-1" />
              <div className="flex-1 min-w-0">
                <span className="text-gray-400 text-xs">Data de Nascimento</span>
                {edit.birth_date ? (
                  <div className="flex gap-2 items-center mt-1 flex-wrap">
                    <input
                      name="birth_date"
                      type="date"
                      value={form.birth_date ? form.birth_date.slice(0, 10) : ""}
                      onChange={handleChange}
                      className="px-3 py-2 rounded-lg border-2 border-primary-500 bg-dark-900 text-white focus:border-primary-400 outline-none transition-all w-44"
                    />
                    <button onClick={() => handleSave("birth_date")} className="text-green-400 hover:text-green-500" disabled={saving}><Check size={22} /></button>
                    <button onClick={() => setEdit((e) => ({ ...e, birth_date: false }))} className="text-red-400 hover:text-red-500"><X size={22} /></button>
                  </div>
                ) : (
                  <div className="text-white font-bold text-lg flex items-center gap-2 break-words">
                    {form.birth_date ? new Date(form.birth_date).toLocaleDateString("pt-BR") : <span className="text-gray-500">Não informado</span>}
                    <button onClick={() => setEdit((e) => ({ ...e, birth_date: true }))} className="text-primary-400 hover:text-primary-300 flex-shrink-0"><i className="fa-solid fa-pen-to-square"></i></button>
                  </div>
                )}
              </div>
            </motion.div>
            {/* Linha 2 */}
            <motion.div 
              className="bg-dark-800 rounded-xl p-5 flex items-start gap-4 shadow min-h-[80px]"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                duration: 0.5, 
                ease: "easeOut",
                delay: 0.8
              }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <UserCircle size={28} className="text-primary-400 flex-shrink-0 mt-1" />
              <div className="flex-1 min-w-0">
                <span className="text-gray-400 text-xs">E-mail</span>
                <div className="text-white font-bold text-lg break-all">{user.email}</div>
              </div>
            </motion.div>
            <motion.div 
              className="bg-dark-800 rounded-xl p-5 flex items-start gap-4 shadow min-h-[80px]"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                duration: 0.5, 
                ease: "easeOut",
                delay: 0.9
              }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Phone size={28} className="text-primary-400 flex-shrink-0 mt-1" />
              <div className="flex-1 min-w-0">
                <span className="text-gray-400 text-xs">Telefone</span>
                {edit.phone ? (
                  <div className="flex gap-2 items-center mt-1 flex-wrap">
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      className="px-3 py-2 rounded-lg border-2 border-primary-500 bg-dark-900 text-white focus:border-primary-400 outline-none transition-all w-44"
                      placeholder="(11) 99999-9999"
                    />
                    <button onClick={() => handleSave("phone")} className="text-green-400 hover:text-green-500" disabled={saving}><Check size={22} /></button>
                    <button onClick={() => setEdit((e) => ({ ...e, phone: false }))} className="text-red-400 hover:text-red-500"><X size={22} /></button>
                  </div>
                ) : (
                  <div className="text-white font-bold text-lg flex items-center gap-2 break-words">
                    {form.phone || <span className="text-gray-500">Não informado</span>}
                    <button onClick={() => setEdit((e) => ({ ...e, phone: true }))} className="text-primary-400 hover:text-primary-300 flex-shrink-0"><i className="fa-solid fa-pen-to-square"></i></button>
                  </div>
                )}
              </div>
            </motion.div>
            {/* Linha 3 */}
            <motion.div 
              className="bg-dark-800 rounded-xl p-5 flex items-start gap-4 shadow min-h-[80px]"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                duration: 0.5, 
                ease: "easeOut",
                delay: 1.0
              }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Calendar size={28} className="text-primary-400 flex-shrink-0 mt-1" />
              <div className="flex-1 min-w-0">
                <span className="text-gray-400 text-xs">Data de Cadastro</span>
                <div className="text-white font-bold text-lg break-words">{new Date(user.created_at).toLocaleDateString("pt-BR")}</div>
              </div>
            </motion.div>
            <motion.div 
              className="bg-dark-800 rounded-xl p-5 flex items-start gap-4 shadow min-h-[80px]"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                duration: 0.5, 
                ease: "easeOut",
                delay: 1.1
              }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <IdentificationCard size={28} className="text-primary-400 flex-shrink-0 mt-1" />
              <div className="flex-1 min-w-0">
                <span className="text-gray-400 text-xs">CPF</span>
                {edit.cpf ? (
                  <div className="flex gap-2 items-center mt-1 flex-wrap">
                    <input
                      name="cpf"
                      value={form.cpf}
                      onChange={handleChange}
                      className="px-3 py-2 rounded-lg border-2 border-primary-500 bg-dark-900 text-white focus:border-primary-400 outline-none transition-all w-44"
                      placeholder="000.000.000-00"
                    />
                    <button onClick={() => handleSave("cpf")} className="text-green-400 hover:text-green-500" disabled={saving}><Check size={22} /></button>
                    <button onClick={() => setEdit((e) => ({ ...e, cpf: false }))} className="text-red-400 hover:text-red-500"><X size={22} /></button>
                  </div>
                ) : (
                  <div className="text-white font-bold text-lg flex items-center gap-2 break-words">
                    {form.cpf || <span className="text-gray-500">Não informado</span>}
                    <button onClick={() => setEdit((e) => ({ ...e, cpf: true }))} className="text-primary-400 hover:text-primary-300 flex-shrink-0"><i className="fa-solid fa-pen-to-square"></i></button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
          {/* Endereço - linha inteira */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.5, 
              ease: "easeOut",
              delay: 1.2
            }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="bg-dark-800 rounded-xl p-5 flex items-start gap-4 shadow w-full min-h-[80px]">
              <House size={28} className="text-primary-400 flex-shrink-0 mt-1" />
              <div className="flex-1 min-w-0">
                <span className="text-gray-400 text-xs">Endereço</span>
                {edit.address ? (
                  <div className="flex gap-2 items-start mt-1 flex-wrap">
                    <textarea
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      className="px-3 py-2 rounded-lg border-2 border-primary-500 bg-dark-900 text-white focus:border-primary-400 outline-none transition-all w-full min-h-[60px] resize-none"
                      placeholder="Rua, número, bairro, cidade, UF, CEP"
                    />
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => handleSave("address")} className="text-green-400 hover:text-green-500" disabled={saving}><Check size={22} /></button>
                      <button onClick={() => setEdit((e) => ({ ...e, address: false }))} className="text-red-400 hover:text-red-500"><X size={22} /></button>
                    </div>
                  </div>
                ) : (
                  <div className="text-white font-bold text-lg flex items-start gap-2 break-words">
                    <span className="flex-1">{form.address || <span className="text-gray-500">Não informado</span>}</span>
                    <button onClick={() => setEdit((e) => ({ ...e, address: true }))} className="text-primary-400 hover:text-primary-300 flex-shrink-0"><i className="fa-solid fa-pen-to-square"></i></button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
        
        {/* Aviso de segurança discreto */}
        <motion.div 
          className="w-full flex justify-center mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ 
            duration: 0.5, 
            ease: "easeOut",
            delay: 1.4
          }}
        >
          <span className="flex items-center gap-1 text-xs text-gray-500"><ShieldCheck size={14} className="text-gray-500" /> Seus dados estão protegidos e só você pode ver esta página.</span>
        </motion.div>
        
        <AnimatePresence>
          {(success || error) && (
            <motion.div 
              className={`mt-4 p-3 rounded-lg text-center font-semibold ${success ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"}`}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {success || error}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
} 