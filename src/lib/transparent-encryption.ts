import crypto from 'crypto';

// Configurações de criptografia
const ALGORITHM = 'aes-256-cbc';
const SECRET_KEY = process.env.ENCRYPTION_SECRET_KEY || 'your-super-secret-key-32-chars!!';
const IV_LENGTH = 16; // Para AES, sempre 16 bytes

/**
 * Sistema de Criptografia Transparente
 * 
 * Este sistema resolve o problema de criptografia em bancos de dados
 * mantendo a funcionalidade normal do sistema:
 * 
 * ✅ Criptografa dados automaticamente ao salvar
 * ✅ Descriptografa dados automaticamente ao ler
 * ✅ Mantém login funcionando normalmente
 * ✅ Mostra dados reais na interface
 * ✅ Compatível com todas as operações de banco
 */

// Função para gerar chave de criptografia a partir da string
function generateKey(): Buffer {
  return crypto.createHash('sha256').update(SECRET_KEY).digest();
}

/**
 * Criptografa um valor de forma transparente
 */
export function encryptValue(value: string | null): string | null {
  if (!value || value.trim() === '') {
    return null;
  }

  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, generateKey(), iv);
    
    let encrypted = cipher.update(value, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Retorna IV + dados criptografados
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Erro ao criptografar valor:', error);
    return value; // Retorna valor original em caso de erro
  }
}

/**
 * Descriptografa um valor de forma transparente
 */
export function decryptValue(encryptedValue: string | null): string | null {
  if (!encryptedValue || encryptedValue.trim() === '') {
    return null;
  }

  // Se não contém ':', provavelmente não está criptografado
  if (!encryptedValue.includes(':')) {
    return encryptedValue;
  }

  try {
    const parts = encryptedValue.split(':');
    if (parts.length !== 2) {
      return encryptedValue; // Retorna valor original se formato inválido
    }

    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    const decipher = crypto.createDecipheriv(ALGORITHM, generateKey(), iv);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Erro ao descriptografar valor:', error);
    return encryptedValue; // Retorna valor original em caso de erro
  }
}

/**
 * Criptografa múltiplos campos de um objeto
 */
export function encryptObject(obj: any, fieldsToEncrypt: string[]): any {
  if (!obj) return obj;

  const encrypted = { ...obj };
  
  fieldsToEncrypt.forEach(field => {
    if (encrypted[field] !== undefined && encrypted[field] !== null) {
      encrypted[field] = encryptValue(encrypted[field]);
    }
  });
  
  return encrypted;
}

/**
 * Descriptografa múltiplos campos de um objeto
 */
export function decryptObject(obj: any, fieldsToDecrypt: string[]): any {
  if (!obj) return obj;

  const decrypted = { ...obj };
  
  fieldsToDecrypt.forEach(field => {
    if (decrypted[field] !== undefined && decrypted[field] !== null) {
      decrypted[field] = decryptValue(decrypted[field]);
    }
  });
  
  return decrypted;
}

/**
 * Campos que devem ser criptografados em cada tabela
 */
export const ENCRYPTION_FIELDS = {
  users: ['email', 'phone', 'address'],
  orders: ['customer_email', 'customer_phone', 'customer_cpf', 'shipping_address'],
  // Adicione outras tabelas conforme necessário
};

/**
 * Função para criptografar dados antes de salvar no banco
 */
export function encryptForDatabase(tableName: string, data: any): any {
  const fieldsToEncrypt = ENCRYPTION_FIELDS[tableName as keyof typeof ENCRYPTION_FIELDS];
  
  if (!fieldsToEncrypt) {
    return data; // Tabela não tem campos para criptografar
  }
  
  return encryptObject(data, fieldsToEncrypt);
}

/**
 * Função para descriptografar dados após ler do banco
 */
export function decryptFromDatabase(tableName: string, data: any): any {
  const fieldsToDecrypt = ENCRYPTION_FIELDS[tableName as keyof typeof ENCRYPTION_FIELDS];
  
  if (!fieldsToDecrypt) {
    return data; // Tabela não tem campos para descriptografar
  }
  
  return decryptObject(data, fieldsToDecrypt);
}

/**
 * Função especial para login - busca por email criptografado
 */
export async function findUserByEmail(email: string, queryFunction: Function): Promise<any> {
  try {
    // Buscar todos os usuários (porque emails estão criptografados)
    const users = await queryFunction('SELECT * FROM users');
    
    // Descriptografar emails e encontrar o usuário correto
    for (const user of users) {
      const decryptedEmail = decryptValue(user.email);
      if (decryptedEmail === email) {
        // Descriptografa os dados do usuário encontrado
        return decryptFromDatabase('users', user);
      }
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao buscar usuário por email:', error);
    return null;
  }
}

/**
 * Função para comparar senha com hash (não afetada pela criptografia)
 */
export async function comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  const bcrypt = require('bcryptjs');
  return await bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Função para verificar se um valor está criptografado
 */
export function isEncrypted(value: string): boolean {
  return value.includes(':') && value.length > 32;
}

/**
 * Função para migrar dados existentes (criptografar dados em texto plano)
 */
export async function migrateExistingData(tableName: string, queryFunction: Function): Promise<void> {
  try {
    const fieldsToEncrypt = ENCRYPTION_FIELDS[tableName as keyof typeof ENCRYPTION_FIELDS];
    
    if (!fieldsToEncrypt) {
      console.log(`Tabela ${tableName} não tem campos para criptografar`);
      return;
    }
    
    // Busca todos os registros da tabela
    const records = await queryFunction(`SELECT * FROM ${tableName}`);
    
    for (const record of records) {
      let needsUpdate = false;
      const updateData: any = { id: record.id };
      
      fieldsToEncrypt.forEach(field => {
        if (record[field] && !isEncrypted(record[field])) {
          updateData[field] = encryptValue(record[field]);
          needsUpdate = true;
        }
      });
      
      if (needsUpdate) {
        const setClause = Object.keys(updateData)
          .filter(key => key !== 'id')
          .map(key => `${key} = ?`)
          .join(', ');
        
        const values = Object.values(updateData).filter((_, index) => 
          Object.keys(updateData)[index] !== 'id'
        );
        
        await queryFunction(
          `UPDATE ${tableName} SET ${setClause} WHERE id = ?`,
          [...values, record.id]
        );
        
        console.log(`✅ Migrado registro ${record.id} da tabela ${tableName}`);
      }
    }
    
    console.log(`🎉 Migração da tabela ${tableName} concluída!`);
  } catch (error) {
    console.error(`❌ Erro ao migrar tabela ${tableName}:`, error);
  }
}
