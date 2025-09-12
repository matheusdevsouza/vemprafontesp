"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, 
  Plus, 
  PencilSimple, 
  Trash, 
  Check, 
  X, 
  Star,
  House,
  User
} from "phosphor-react";

interface Address {
  id: number;
  name: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

interface AddressForm {
  name: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
}

export default function EnderecosPage() {
  const { user, authenticated, loading } = useAuth();
  const router = useRouter();
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [form, setForm] = useState<AddressForm>({
    name: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    zip_code: ""
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [tempMessage, setTempMessage] = useState("");

  useEffect(() => {
    if (!loading && !authenticated) {
      router.replace("/login");
    }
  }, [authenticated, loading, router]);

  useEffect(() => {
    if (authenticated) {
      fetchAddresses();
    }
  }, [authenticated]);

  async function fetchAddresses() {
    try {
      const res = await fetch("/api/addresses");
      if (res.ok) {
        const data = await res.json();
        setAddresses(data);
      } else {
        setError("Erro ao carregar endereços");
      }
    } catch (err) {
      setError("Erro ao carregar endereços");
    } finally {
      setLoadingAddresses(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingAddress) {
      updateAddress();
    } else {
      createAddress();
    }
  }

  async function createAddress() {
    setSaving(true);
    setError("");
    setSuccess("");
    
    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      if (res.ok) {
        setSuccess("Endereço adicionado com sucesso!");
        setForm({
          name: "",
          street: "",
          number: "",
          complement: "",
          neighborhood: "",
          city: "",
          state: "",
          zip_code: ""
        });
        setShowForm(false);
        fetchAddresses();
      } else {
        const data = await res.json();
        setError(data.message || "Erro ao adicionar endereço");
      }
    } catch (err) {
      setError("Erro ao adicionar endereço");
    } finally {
      setSaving(false);
    }
  }

  async function updateAddress() {
    if (!editingAddress) return;
    
    setSaving(true);
    setError("");
    setSuccess("");
    
    try {
      const res = await fetch(`/api/addresses/${editingAddress.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      if (res.ok) {
        setSuccess("Endereço atualizado com sucesso!");
        setForm({
          name: "",
          street: "",
          number: "",
          complement: "",
          neighborhood: "",
          city: "",
          state: "",
          zip_code: ""
        });
        setEditingAddress(null);
        setShowForm(false);
        fetchAddresses();
      } else {
        const data = await res.json();
        setError(data.message || "Erro ao atualizar endereço");
      }
    } catch (err) {
      setError("Erro ao atualizar endereço");
    } finally {
      setSaving(false);
    }
  }

  async function deleteAddress(id: number) {
    try {
      const res = await fetch(`/api/addresses/${id}`, {
        method: "DELETE"
      });

      if (res.ok) {
        setTempMessage("Endereço excluído com sucesso!");
        setTimeout(() => setTempMessage(""), 2000); // Sumir após 2 segundos
        fetchAddresses();
      } else {
        const data = await res.json();
        setError(data.message || "Erro ao excluir endereço");
      }
    } catch (err) {
      setError("Erro ao excluir endereço");
    }
  }

  async function setDefaultAddress(id: number) {
    try {
      // Verificar se o endereço atual é padrão
      const currentAddress = addresses.find(addr => addr.id === id);
      const isCurrentlyDefault = currentAddress?.is_default;

      const res = await fetch(`/api/addresses/${id}/default`, {
        method: "PUT"
      });

      if (res.ok) {
        if (!isCurrentlyDefault) {
          // Mostrar mensagem temporária quando definir como padrão
          setTempMessage("Endereço definido como padrão!");
          setTimeout(() => setTempMessage(""), 2000); // Sumir após 2 segundos
        } else {
          // Mostrar mensagem temporária quando remover como padrão
          setTempMessage("Endereço removido como padrão!");
          setTimeout(() => setTempMessage(""), 2000); // Sumir após 2 segundos
        }
        fetchAddresses();
      } else {
        const data = await res.json();
        setError(data.message || "Erro ao alterar endereço padrão");
      }
    } catch (err) {
      setError("Erro ao alterar endereço padrão");
    }
  }

  function editAddress(address: Address) {
    setEditingAddress(address);
    setForm({
      name: address.name || "",
      street: address.street,
      number: address.number,
      complement: address.complement || "",
      neighborhood: address.neighborhood,
      city: address.city,
      state: address.state,
      zip_code: address.zip_code
    });
    setShowForm(true);
  }

  function cancelEdit() {
    setEditingAddress(null);
    setForm({
      name: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      zip_code: ""
    });
    setShowForm(false);
  }

  if (loading || !user) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-dark-950">
        <div className="w-full max-w-4xl bg-dark-900 border border-dark-800 rounded-3xl shadow-2xl p-0 md:p-10 flex flex-col gap-8 animate-pulse">
          {/* Skeleton do topo */}
          <div className="flex flex-col items-center justify-center gap-2 bg-dark-900 rounded-t-3xl p-8 border-b border-dark-800">
            <div className="h-8 w-48 bg-dark-800 rounded mb-3" />
            <div className="h-5 w-40 bg-dark-800 rounded" />
          </div>
          {/* Skeleton dos endereços */}
          <div className="w-full flex flex-col gap-6 p-4 md:p-0">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-dark-800 rounded-xl p-5 h-32 flex flex-col gap-3 shadow">
                <div className="flex justify-between items-start">
                  <div className="h-6 w-32 bg-dark-900 rounded" />
                  <div className="h-6 w-20 bg-dark-900 rounded" />
                </div>
                <div className="h-4 w-full bg-dark-900 rounded" />
                <div className="h-4 w-3/4 bg-dark-900 rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
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
        {/* Header */}
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
          <div className="flex items-center gap-3 mb-2">
            <MapPin size={32} className="text-primary-400" />
            <h1 className="text-3xl md:text-4xl font-extrabold text-white">Meus Endereços</h1>
          </div>
          <p className="text-gray-400 text-base md:text-lg text-center">
            Gerencie seus endereços de entrega
          </p>
        </motion.div>



        {/* Formulário */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="bg-dark-800 rounded-xl p-6 border border-dark-700"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                  {editingAddress ? "Editar Endereço" : "Novo Endereço"}
                </h2>
                <button
                  onClick={cancelEdit}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nome do Endereço
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Ex: Casa, Trabalho"
                      className="w-full px-4 py-3 bg-dark-900 border border-dark-700 rounded-lg text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      CEP
                    </label>
                    <input
                      type="text"
                      name="zip_code"
                      value={form.zip_code}
                      onChange={handleChange}
                      placeholder="00000-000"
                      className="w-full px-4 py-3 bg-dark-900 border border-dark-700 rounded-lg text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Rua
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={form.street}
                    onChange={handleChange}
                    placeholder="Nome da rua"
                    className="w-full px-4 py-3 bg-dark-900 border border-dark-700 rounded-lg text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none transition-colors"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Número
                    </label>
                    <input
                      type="text"
                      name="number"
                      value={form.number}
                      onChange={handleChange}
                      placeholder="123"
                      className="w-full px-4 py-3 bg-dark-900 border border-dark-700 rounded-lg text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Complemento
                    </label>
                    <input
                      type="text"
                      name="complement"
                      value={form.complement}
                      onChange={handleChange}
                      placeholder="Apto, Bloco, etc."
                      className="w-full px-4 py-3 bg-dark-900 border border-dark-700 rounded-lg text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bairro
                  </label>
                  <input
                    type="text"
                    name="neighborhood"
                    value={form.neighborhood}
                    onChange={handleChange}
                    placeholder="Nome do bairro"
                    className="w-full px-4 py-3 bg-dark-900 border border-dark-700 rounded-lg text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none transition-colors"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Cidade
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      placeholder="Nome da cidade"
                      className="w-full px-4 py-3 bg-dark-900 border border-dark-700 rounded-lg text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Estado
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                      placeholder="SP"
                      maxLength={2}
                      className="w-full px-4 py-3 bg-dark-900 border border-dark-700 rounded-lg text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none transition-colors uppercase"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105 disabled:scale-100 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Check size={20} />
                        {editingAddress ? "Atualizar" : "Adicionar"}
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-6 py-3 border border-dark-700 text-gray-300 hover:text-white hover:border-dark-600 rounded-lg font-semibold transition-all duration-200"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lista de Endereços */}
        <motion.div
          className="w-full flex flex-col gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ 
            duration: 0.5, 
            ease: "easeOut",
            delay: 0.7
          }}
        >
          {loadingAddresses ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="bg-dark-800 rounded-xl p-5 h-32 animate-pulse"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="h-6 w-32 bg-dark-900 rounded" />
                    <div className="h-6 w-20 bg-dark-900 rounded" />
                  </div>
                  <div className="h-4 w-full bg-dark-900 rounded mb-2" />
                  <div className="h-4 w-3/4 bg-dark-900 rounded" />
                </motion.div>
              ))}
            </div>
          ) : addresses.length === 0 ? (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <MapPin size={64} className="text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                Nenhum endereço cadastrado
              </h3>
              <p className="text-gray-500 mb-6">
                Adicione seu primeiro endereço para facilitar suas compras
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105"
              >
                Adicionar Endereço
              </button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {addresses.map((address, index) => (
                <motion.div
                  key={address.id}
                  className="bg-dark-800 rounded-xl p-5 border border-dark-700 hover:border-dark-600 transition-all duration-200"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <House size={20} className="text-primary-400" />
                      <h3 className="text-lg font-semibold text-white">
                        {address.name || "Endereço"}
                      </h3>
                      <button
                        onClick={() => setDefaultAddress(address.id)}
                        className={`transition-colors ${
                          address.is_default 
                            ? "text-red-400 hover:text-red-300" 
                            : "text-gray-400 hover:text-primary-400"
                        }`}
                        title={address.is_default ? "Remover como padrão" : "Definir como padrão"}
                      >
                        <Star size={20} weight={address.is_default ? "fill" : "regular"} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => editAddress(address)}
                        className="text-gray-400 hover:text-white transition-colors"
                        title="Editar"
                      >
                        <PencilSimple size={20} />
                      </button>
                      <button
                        onClick={() => deleteAddress(address.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        title="Excluir"
                      >
                        <Trash size={20} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-gray-300 space-y-1">
                    <p>
                      {address.street}, {address.number}
                      {address.complement && ` - ${address.complement}`}
                    </p>
                    <p>{address.neighborhood}</p>
                    <p>{address.city} - {address.state}</p>
                    <p className="text-gray-400">{address.zip_code}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Botão Adicionar - Só aparece quando já existem endereços */}
        {addresses.length > 0 && (
          <motion.div
            className="w-full flex justify-center mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ 
              duration: 0.5, 
              ease: "easeOut",
              delay: 0.9
            }}
          >
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg"
            >
              <Plus size={20} />
              Adicionar Endereço
            </button>
          </motion.div>
        )}

        {/* Mensagem Temporária */}
        <AnimatePresence>
          {tempMessage && (
            <motion.div 
              className="w-full flex justify-center mt-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div className="bg-green-500/20 text-green-400 border border-green-500/30 px-4 py-2 rounded-lg text-sm font-medium">
                {tempMessage}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mensagens de Feedback */}
        <AnimatePresence>
          {(success || error) && (
            <motion.div 
              className={`p-4 rounded-lg text-center font-semibold ${success ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"}`}
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