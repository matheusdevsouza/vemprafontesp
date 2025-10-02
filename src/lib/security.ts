import crypto from 'crypto';

// Configurações de segurança
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32);
const IV_LENGTH = 16; // Para AES, isso é sempre 16

/**
 * Criptografa dados sensíveis usando AES-256-CBC
 */
export function encrypt(text: string): string {
  if (!text) return '';
  
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Descriptografa dados sensíveis usando AES-256-CBC
 */
export function decrypt(text: string): string {
  if (!text) return '';
  
  try {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift() || '', 'hex');
    const encryptedText = textParts.join(':');
    const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Erro ao descriptografar:', error);
    return '';
  }
}

/**
 * Mascara dados sensíveis para exibição
 */
export function maskSensitiveData(data: string, type: 'cpf' | 'email' | 'phone'): string {
  if (!data) return '';
  
  switch (type) {
    case 'cpf':
      // Formatar CPF: 123.456.789-01 -> 123.***.***-01
      if (data.length === 11) {
        return `${data.substring(0, 3)}.***.***-${data.substring(9)}`;
      }
      return data;
      
    case 'email':
      // Formatar email: user@domain.com -> u***@d***.com
      const [local, domain] = data.split('@');
      if (local && domain) {
        const maskedLocal = local.charAt(0) + '*'.repeat(Math.max(1, local.length - 1));
        const [domainName, tld] = domain.split('.');
        const maskedDomain = domainName.charAt(0) + '*'.repeat(Math.max(1, domainName.length - 1));
        return `${maskedLocal}@${maskedDomain}.${tld}`;
      }
      return data;
      
    case 'phone':
      // Formatar telefone: (11) 99999-9999 -> (11) 9****-9999
      if (data.length >= 10) {
        return data.substring(0, 5) + '*'.repeat(Math.max(1, data.length - 8)) + data.substring(data.length - 4);
      }
      return data;
      
    default:
      return data;
  }
}

/**
 * Valida e sanitiza entrada para prevenir ataques
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/[<>]/g, '') // Remove tags HTML
    .replace(/['"]/g, '') // Remove aspas
    .replace(/[;]/g, '') // Remove ponto e vírgula
    .replace(/[--]/g, '') // Remove comentários SQL
    .trim();
}

/**
 * Valida formato de CPF
 */
export function isValidCPF(cpf: string): boolean {
  if (!cpf) return false;
  
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = 11 - (sum % 11);
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(9))) return false;
  
  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = 11 - (sum % 11);
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(10))) return false;
  
  return true;
}

/**
 * Formata CPF para exibição
 */
export function formatCPF(cpf: string): string {
  if (!cpf) return '';
  
  const cleanCPF = cpf.replace(/\D/g, '');
  if (cleanCPF.length === 11) {
    return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  return cpf;
}

/**
 * Formata endereço JSON para exibição legível
 */
export function formatAddress(addressString: string): {
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  zipcode: string;
  shipping_cost: number;
} | null {
  if (!addressString) return null;
  
  try {
    const address = typeof addressString === 'string' ? JSON.parse(addressString) : addressString;
    
    return {
      street: address.street || '',
      number: address.number || '',
      complement: address.complement || '',
      neighborhood: address.neighborhood || '',
      city: address.city || '',
      state: address.state || '',
      zipcode: address.zipcode || '',
      shipping_cost: address.shipping_cost || 0
    };
  } catch (error) {
    console.error('Erro ao formatar endereço:', error);
    return null;
  }
}

/**
 * Gera hash seguro para auditoria
 */
export function generateAuditHash(data: string): string {
  return crypto.createHash('sha256').update(data + Date.now()).digest('hex');
}

/**
 * Verifica se o usuário tem permissão para acessar dados sensíveis
 */
export function hasPermissionToViewSensitiveData(user: any): boolean {
  return user && user.isAdmin === true;
}



