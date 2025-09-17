/**
 * Utilitário para lidar com dados de usuário de forma segura
 * Garante que dados criptografados sejam tratados adequadamente
 */

export interface SafeUserData {
  id: number;
  name: string;
  email: string;
  phone?: string;
  cpf?: string;
  address?: string;
  display_name?: string;
  birth_date?: string;
  gender?: string;
  email_verified_at?: string;
  last_login?: string;
  is_admin: boolean;
  created_at: string;
}

/**
 * Processa dados de usuário de forma segura
 * Se os dados estiverem criptografados, retorna um placeholder amigável
 */
export function processSafeUserData(userData: any): SafeUserData {
  const isEncrypted = (value: string): boolean => {
    return Boolean(value && value.includes(':') && value.length > 50);
  };

  const getSafeValue = (value: string, placeholder: string = 'Não informado'): string => {
    if (!value) return placeholder;
    if (isEncrypted(value)) return '[Dados protegidos]';
    return value;
  };

  return {
    id: userData.id,
    name: getSafeValue(userData.name, 'Usuário'),
    email: getSafeValue(userData.email, 'email@exemplo.com'),
    phone: getSafeValue(userData.phone),
    cpf: getSafeValue(userData.cpf),
    address: getSafeValue(userData.address),
    display_name: getSafeValue(userData.display_name),
    birth_date: userData.birth_date || 'Não informado',
    gender: userData.gender || 'Não informado',
    email_verified_at: userData.email_verified_at,
    last_login: userData.last_login,
    is_admin: userData.is_admin || false,
    created_at: userData.created_at
  };
}

/**
 * Verifica se os dados do usuário estão criptografados
 */
export function isUserDataEncrypted(userData: any): boolean {
  return (
    (userData.name && userData.name.includes(':') && userData.name.length > 50) ||
    (userData.email && userData.email.includes(':') && userData.email.length > 50)
  );
}

/**
 * Retorna uma mensagem amigável para dados criptografados
 */
export function getEncryptedDataMessage(): string {
  return 'Seus dados estão protegidos e sendo processados com segurança.';
}



